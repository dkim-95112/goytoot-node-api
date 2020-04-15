const express = require('express');
const router = express.Router();
const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://atlasadmin:atlasadmin@cluster0-910s3.mongodb.net/anon?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let db;
client.connect(err => {
    assert.equal(err, null);
    db = client.db();
});
router.get('/', function (req, res, next) {
    const cursor = db.collection('tweets').find()
    const resp = [];
    cursor.forEach(doc => {
        resp.push(doc.body_text);
    }, err => {
        res.send(resp.join('\n'));
    })
});

module.exports = router;
