const mongo = require("mongodb").MongoClient;
const config = require("./config").config;
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
var nodemailer = require('nodemailer');

const connection = () => new Promise((resolve, reject) => {
    let client = new mongo(config.DB.Uri, { useNewUrlParser: true });
    client.connect((err, db) => {
        if (err) reject(err);
        resolve(client.db("MediaShare"))
    })
})

exports.registerUser = async (user) => {
    let db = await connection();
    let inserted = await db.collection("users").updateOne({ email: user.email, name: user.name }, { $set: user }, { upsert: true });
    let userInserted = await db.collection("users").findOne({ email: user.email });
    return userInserted;
}

exports.GetUserSubjects = async (userID, email) => {
    return new Promise(async (resolve, reject) => {
        let db = await connection();
        await db.collection("subjects").aggregate([
            {
                $lookup: {
                    from: "groups",
                    let: { group_ids: "$groups" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$group_ids"]
                                }
                            }
                        }
                    ],
                    as: "groups"
                },
                $lookup:
                {
                    from: "users",
                    let: { userID: "$media" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$userID"]
                                }
                            }
                        }
                    ],
                    as: "user"
                }
            },
            {
                $match: {
                    $or: [
                        { 'subjectCreator': ObjectId(userID) },
                        { 'groups.members': email }
                    ]
                }
            }
        ]).toArray(function (err, docs) {
            console.log(docs)
            resolve(docs);
        });
    });
}

exports.AddSubject = async (subject) => {
    let db = await connection();
    let inserted = await db.collection("subjects").insertOne({
        name: subject.name,
        subjectCreator: ObjectId(subject.subjectCreator),
        groups: [],
        media: []
    });
    return inserted;
}
exports.GetSpecificSubjects = async (subject) => {
    let db = await connection();
    let select = await db.collection("subjects").findOne({
        name: subject.name,
        subjectCreator: ObjectId(subject.subjectCreator),
    });
    return select;
}
exports.SendEmail = async (email) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mediasharemanager@gmail.com',
            pass: 'Fin@lPro10'
        },
    });

    var mailOptions = {
        from: 'mediasharemanager@gmail.com',
        to: email,
        subject: 'Join To MediaShare',
        text: 'Find us On Application Store'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return error;
        } else {
            console.log('Email sent: ' + info.response);
            return info.response;
        }
    });
}
exports.AddMedia = async (mediaUploader, type, path, subjectID, base64 = null) => {
    let db = await connection();
    let inserted = await db.collection("subjects").updateOne(
        { _id: ObjectId(subjectID) },
        {
            $push: {
                media: {
                    id: ObjectId(),
                    mediaUploader: ObjectId(mediaUploader),
                    type: type,
                    path: path,
                    base64: base64,
                    uploadDate: moment(Date.now()).format('DD/MM/YYYY HH:mm:ss')
                }
            }
        });
    return inserted
}


exports.addGroup = async (group) => {
    let db = await connection();
    let inserted = await db.collection("groups").updateOne({
        groupName: group.groupName,
        groupAdmin: group.groupAdmin,
        members: []
    }, { $set: group }, { upsert: true });
    console.log(`1 group inserted: ${group.groupName},  by: ${group.groupAdmin}`);
    return inserted;
}

exports.deleteGroup = async (group) => {
    let db = await connection();
    await db.collection("groups").deleteOne({
        groupName: group.groupName,
        groupAdmin: group.groupAdmin
    }, function (err, obj) {
        if (err) throw err;
        console.log(`1 group deleted: ${group.groupName},  by: ${group.groupAdmin}`);
    });
}

exports.addMemberToGroup = async (group, email) => {
    let db = await connection();
    let userToAdd = await db.collection("users").findOne({ email: email });
    if (userToAdd) {

        let inserted = await db.collection("groups").updateOne(
            {
                _id: ObjectId(group.groupID),
                groupAdmin: group.groupAdmin,
            },
            { $push: { members: email } }
        )
        console.log(`member: ${email} inserted to group: ${group.groupName},  by: ${group.groupAdmin}`);
        return inserted;
    }
    else {
        console.warn(`no such user with email : ${email}`);
        return null;
    }
}

exports.deleteMemberFromGroup = async (group, email) => {
    let db = await connection();
    await db.collection("groups").updateOne(
        {
            _id: ObjectId(group.groupID),
            groupAdmin: group.groupAdmin,
        },
        { $pull: { members: email } }
        , function (err, obj) {
            if (err) throw err;
            console.log(`member:  ${email} deleted from: ${group.groupName},  by: ${group.groupAdmin}`);
            return true;
        }
    )
}

exports.getGroups = async (groupAdmin) => {
    return new Promise(async (resolve, reject) => {
        let db = await connection();
        await db.collection("groups").find(
            {
                groupAdmin: groupAdmin,
            }
        ).toArray(function (err, result) {
            if (err) {
                reject(null);
            }
            console.log(`get groups of ${groupAdmin}\n`, result);
            resolve(result);
        });
    });
}
exports.getGroupDetails = async (group, callback) => {
    return new Promise(async (resolve, reject) => {
        let db = await connection();
        let details = await db.collection("groups").findOne(
            {
                _id: ObjectId(group.groupID),
                groupAdmin: group.groupAdmin,
            }
        );
        if (!details) {
            reject(null);
        }
        console.log(`get the Details of group ${group.groupName} by admin: ${group.groupAdmin} \n`, details);
        resolve(details);
    });
    // console.log(`member: ${email} inserted to group: ${group.groupName},  by: ${group.groupAdmin}`);
}