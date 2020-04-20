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
const findDocuments = function (db, callback) {
    // Get the documents collection
    const collection = db.collection('tweets');
    // Find some documents
    collection.find({}).toArray( (err, docs) => {
        assert.equal(err, null);
        console.log("Found the following records");
        console.log(docs)
        callback(docs);
    });
}
router.get('/', function (req, res, next) {
    findDocuments(db, docs => {
        res.json(docs)
    });
});

module.exports = router;
