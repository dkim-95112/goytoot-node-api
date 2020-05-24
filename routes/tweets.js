"use strict";
const express = require('express');
const router = express.Router();
const assert = require('assert').strict;
const mongoose = require('mongoose');
const tootSchema = new mongoose.Schema({
    bodyText: String
});
// Todo: add methods before compiling with '.model()'
const Toot = mongoose.model('Toot', tootSchema);
router.get('/', (req, res) => {
    Toot.find()
        .then(docs => {
            console.log('Found docs: %o', docs);
            res.status(200).json({
                message: "Success",
                docs,
            })
        })
        .catch(err => {
            console.error('Caught: %o', err);
            res.status(500).json({
                message: "Failure"
            })
        })
});
router.post('/', (req, res) => {
    console.log('Inserting req body: %o', req.body);
    const newToot = new Toot({
        bodyText: req.body.bodyText
    });
    newToot.save()
        .then(insertedToot => {
            console.log('inserted toot: %o', insertedToot);
            res.status(201).json({
                message: "Success",
                doc: insertedToot
            });
        })
        .catch(err => {
            console.error('Caught: %o', err)
            res.status(500).json({
                message: "Failure"
            });
        });
});
router.delete('/:id', (req, res) => {
    console.log('Deleting id: %o', req.params.id);
    Toot.deleteOne({_id: req.params.id})
        .then(result => {
            if (result.n > 0) {
                return res.status(200).json({
                    message: "Success"
                });
            }
            res.status(401).json({
                message: "Not authorized ?"
            });
        })
        .catch(err => {
            console.error('Caught %o', err);
            res.status(500).json({
                message: "Failure"
            });
        });
})

module.exports = router;
