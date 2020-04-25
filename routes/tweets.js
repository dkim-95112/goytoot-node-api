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
let tweets;
client.connect(err => {
    assert.equal(err, null);
    console.log("Connected successfully to server");
    db = client.db(dbName);
    tweets = db.collection('tweets');

    // start listen to changes
    const changeStream = tweets.watch();
    changeStream.on("change", function (change) {
        console.log('got change')
        console.log(change);
    });
});
router.get('/', (req, res) => {
    tweets
        .find({}).toArray((err, docs) => {
        assert.equal(err, null);
        console.log("got docs");
        console.log(docs)
        res.json(docs);
    });
});
router.post('/', (req, res) => {
    tweets
        .insertOne(req.body, (err, result) => {
            assert.equal(err, null);
            console.log("got result");
            console.log(result)
            res.json(result);
        });
});

module.exports = router;
