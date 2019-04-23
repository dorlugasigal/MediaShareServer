const express = require('express');
const db = require("./db");
const router = express.Router();

router.post("/registerUser", registerUser);
router.post("/addGroup", addGroup);
router.post("/deleteGroup", deleteGroup);
router.post("/addMemberToGroup", addMemberToGroup);
router.post("/deleteMemberFromGroup", deleteMemberFromGroup);
router.post("/getGroups", getGroups);
router.post("/getGroupDetails", getGroupDetails);


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

async function addGroup(req, res, next) {
    try {
        let inserted = await db.addGroup(req.body.group);
        res.send(inserted);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}

async function deleteGroup(req, res, next) {
    try {
        let inserted = await db.deleteGroup(req.body.group);
        res.send(inserted);
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
        let inserted = await db.deleteMemberFromGroup(req.body.group, req.body.email);
        res.send(inserted);
    }
    catch (err) {
        writeError(err);
        res.send(null);
    }
}
async function getGroups(req, res, next) {
    try {
        await db.getGroups(req.body.groupAdmin).then((ret)=>{
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
        await db.getGroupDetails(req.body.group).then((ret)=> {
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