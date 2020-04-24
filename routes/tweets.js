const express = require('express');
const router = express.Router();
const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://atlasadmin:atlasadmin@cluster0-910s3.mongodb.net/?retryWrites=true&w=majority";
const dbName = 'anon';
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let db;
client.connect(err => {
    assert.equal(err, null);
    console.log("Connected successfully to server");
    db = client.db(dbName);
});
router.get('/', (req, res, next) => {
    findDocuments(docs => {
        res.json(docs)
    });
});
router.post('/', (req, res, next) => {
    postDocuments(req.body, (result) => {
        res.json(result);
    });
});

function postDocuments(docs, callback) {
    db.collection('tweets')
        .insert(docs, (err, result) => {
        assert.equal(err, null);
        console.log("Got following result");
        console.log(result)
        callback(result);
    });
}

function findDocuments(callback) {
    db.collection('tweets')
        .find({}).toArray((err, docs) => {
        assert.equal(err, null);
        console.log("Got following docs");
        console.log(docs)
        callback(docs);
    });
}

module.exports = router;
