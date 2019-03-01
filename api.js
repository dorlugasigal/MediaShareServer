const express = require('express');
const db = require("./db");
const router = express.Router();

router.post("/registerUser", registerUser);

module.exports = router;

async function registerUser(req, res, next){
    let inserted = await db.registerUser(req.body.user);
    res.send(inserted);
}