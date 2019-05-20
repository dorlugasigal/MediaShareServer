const mongo = require("mongodb").MongoClient;
const config = require("./config").config;
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;

const connection = () => new Promise((resolve, reject) => {
    let client = new mongo(config.DB.Uri, { useNewUrlParser: true });
    client.connect((err, db) => {
        if (err) reject(err);
        resolve(client.db("MediaShare"))
    })
})

exports.registerUser = async (user) => {
    let db = await connection();
    let inserted = await db.collection("users").updateOne({ email: user.email }, { $set: user }, { upsert: true });
    return inserted;
}
exports.AddSubject = async (subject) => {
    let db = await connection();
    let inserted = await db.collection("subjects").updateOne({
        name: subject.name,
        subjectCreator: subject.subjectCreator,
        groups: [],
        media: []
    }, { $set: subject }, { upsert: true });
}

exports.AddMedia = async (mediaUploader, type, path, subjectID) => {
    let db = await connection();
    let inserted = await db.collection("subjects").updateOne(
        { _id: ObjectId(subjectID) },
        {
            $push: {
                media: {
                    mediaUploader: mediaUploader,
                    type: type,
                    path: path,
                    uploadDate: moment(Date.now()).format('DD/MM/YYYY HH:mm:ss')
                }
            }
        });
}



exports.GetUserSubjects = async (user) => {
    return new Promise(async (resolve, reject) => {
        let db = await connection();
        await db.collection("subjects").find(
            {
                subjectCreator: user,
            }
        ).toArray(function (err, result) {
            if (err) {
                reject(null);
            }
            console.log(`get medias of ${user}\n`, result);
            resolve(result);
        });
    });
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
    let inserted = await db.collection("groups").updateOne(
        {
            groupName: group.groupName,
            groupAdmin: group.groupAdmin,
        },
        { $push: { members: { email: email } } }
    )
    console.log(`member: ${email} inserted to group: ${group.groupName},  by: ${group.groupAdmin}`);
    return inserted;
}

exports.deleteMemberFromGroup = async (group, email) => {
    let db = await connection();
    await db.collection("groups").updateOne(
        {
            groupName: group.groupName,
            groupAdmin: group.groupAdmin,
        },
        { $pull: { members: { email: email } } }
        , function (err, obj) {
            if (err) throw err;
            console.log(`member:  ${email} deleted from: ${group.groupName},  by: ${group.groupAdmin}`);
            return true;
        })
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
                groupName: group.groupName,
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