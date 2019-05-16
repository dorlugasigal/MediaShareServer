const express = require('express');
const db = require("./db");
const router = express.Router();

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

router.post("/AddPhoto", upload.single('fileData'), (req, res, next) => {
    try {
        res.status(200).json({
            message: 'success!',
        })
        res.send();
        // let inserted = await db.addGroup(req.body.group);
        // let updateGroups= await db.getGroups(req.body.group.groupAdmin)
        // res.send(updateGroups);
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
async function AddSubject(req, res, next) {
    try {
        let inserted = await db.AddSubject(req.body.subject);
        //create a folder
        res.send(inserted);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}
async function GetUserSubjects(req, res, next) {
    try {
        let data = await db.GetUserSubjects(req.body.user);
        res.send(data);
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
        res.send(inserted);
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
        console.log(JSON.stringify(req.body))


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