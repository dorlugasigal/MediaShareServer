const express = require('express');
const db = require("./db");
const router = express.Router();
var nodemailer = require('nodemailer');

var fs = require('fs');
var multer = require('multer');
const Storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, '/Medias')
    },
    filename(req, file, callback) {
        callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}.jpg`)
    },
})

var upload = multer({
    //  dest: 'uploads/',
    storage: Storage,
    limits: { fieldSize: 25 * 1024 * 1024 }
});

router.post("/registerUser", registerUser);
router.post("/addGroup", addGroup);
router.post("/deleteGroup", deleteGroup);
router.post("/addMemberToGroup", addMemberToGroup);
router.post("/deleteMemberFromGroup", deleteMemberFromGroup);
router.post("/getGroups", getGroups);
router.post("/getGroupDetails", getGroupDetails);
router.post("/GetUserSubjects", GetUserSubjects);
router.post("/AddSubject", AddSubject);
router.post("/GetUserName", GetUserName)
router.post("/deleteMediaFromSubject", deleteMediaFromSubject);
router.post("/DeleteSubject", DeleteSubject);
router.post("/AddGroupToSubject", AddGroupToSubject)
router.post("/RemoveGroupFromSubject", RemoveGroupFromSubject)
router.post("/SendEmail", async (req, res, next) => {
    try {
        console.log('send email')
        let data = await db.SendEmail(req.body.email);
        res.send(data);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
});

async function DeleteSubject(req, res, next) {
    try {
        console.log("DeleteSubject");
        const { subjectID, subjectCreator } = req.body;
        let result = await db.DeleteSubject(subjectID, subjectCreator);
        res.send(result);
    }
    catch{
        writeError(err);
        res.send(null);
    }
}

router.post("/AddMedia", async (req, res, next) => {
    try {
        console.log("AddMedia");
        const { mediaUploader, type, path, subject, base64 } = req.body;
        let result = await db.AddMedia(mediaUploader.userID, type, path, subject, base64);
        res.send(result);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
});


module.exports = router;

async function registerUser(req, res, next) {
    try {
        let inserted = await db.registerUser(req.body.user);
        res.send(inserted);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}
async function GetUserSubjects(req, res, next) {
    try {
        let data = await db.GetUserSubjects(req.body.userID, req.body.email);
        res.send(data);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}
async function AddGroupToSubject(req, res, next) {
    try {
        let data = await db.AddGroupToSubject(req.body.subjectID, req.body.groupID);
        res.send(data);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}
async function RemoveGroupFromSubject(req, res, next) {
    try {
        let data = await db.RemoveGroupFromSubject(req.body.subjectID, req.body.groupID);
        res.send(data);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}
async function GetUserName(req, res, next) {
    try {
        console.log('get user name')
        let obj = await db.GetUserName(req.body.id);
        res.send(obj)
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}

async function AddSubject(req, res, next) {
    try {
        let existSubjectID = await db.GetSpecificSubjects(req.body.subject);
        if (existSubjectID) {
            res.send(existSubjectID);
        }
        else {
            let inserted = await db.AddSubject(req.body.subject);
            res.send(inserted.ops[0]);
        }
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}
async function addGroup(req, res, next) {
    try {
        let inserted = await db.addGroup(req.body.group);
        let updateGroups = await db.getGroups(req.body.group.groupAdmin)
        res.send(updateGroups);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}



async function deleteGroup(req, res, next) {
    try {
        await db.deleteGroup(req.body.group);
        let updateGroups = await db.getGroups(req.body.group.groupAdmin)
        res.send(updateGroups);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}

async function addMemberToGroup(req, res, next) {
    try {
        let inserted = await db.addMemberToGroup(req.body.group, req.body.email);
        if (inserted == null) {
            return next(null);
        }
        res.send(inserted);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}
async function deleteMediaFromSubject(req, res, next) {
    try {
        let ret = await db.deleteMediaFromSubject(req.body.subjectID, req.body.subjectCreator, req.body.id, req.body.mediaUploader);
        res.send(ret);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}
async function deleteMemberFromGroup(req, res, next) {
    try {
        await db.deleteMemberFromGroup(req.body.group, req.body.email);
        let updateGroupMembers = await db.getGroupDetails(req.body.group)
        res.send(updateGroupMembers);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}
async function getGroups(req, res, next) {
    try {
        await db.getGroups(req.body.groupAdmin).then((ret) => {
            res.send(ret);
        });
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}
async function getGroupDetails(req, res, next) {
    try {
        await db.getGroupDetails(req.body.group).then((ret) => {
            res.send(ret);
        });
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}



/**
 * error logger function, writes to console
 * 
 * @param {*} error 
 */
async function writeError(error) {
    //manage directories for errors by date
    console.log(`an error has occured:`);
    console.error(error.message);
}