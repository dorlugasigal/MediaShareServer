const mongo = require("mongodb").MongoClient;
const config = require("./config").config;

const connection = () => new Promise((resolve, reject) => {
    let client = new mongo(config.DB.Uri, { useNewUrlParser: true });
    client.connect((err, db) => {
        if (err) reject(err);
        resolve(client.db("MediaShare"))
    })
})

exports.registerUser = async (user) => {
    let db = await connection();
    let inserted = await db.collection("users").updateOne({ "email": user.email }, { $set: user }, { upsert: true });
    return inserted;
}