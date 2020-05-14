"use strict";
const express = require('express');
const router = express.Router();
const assert = require('assert').strict;
router.get('/', (req, res) => {
    req.app.locals.mongoClient.tweets
        .find({}).toArray((err, docs) => {
        assert.equal(err, null);
        console.log("got docs");
        console.log(docs)
        res.json(docs);
    });
});
router.post('/', (req, res) => {
    req.app.locals.mongoClient.tweets
        .insertOne(req.body, (err, result) => {
            assert.equal(err, null);
            console.log("got result");
            console.log(result)
            res.json(result);
        });
});

module.exports = router;
