"use strict";
const express = require('express');
const router = express.Router();
const assert = require('assert').strict;
const mongoose = require('mongoose');
const tootSchema = new mongoose.Schema({
    body_text: String
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
        body_text: req.body.body_text
    });
    newToot.save()
        .then(insertedToot => {
            res.status(201).json({
                message: "Success",
                toot: insertedToot
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
                res.status(200).json({
                    message: "Success"
                });
            } else {
                res.status(401).json({
                    message: "Not authorized ?"
                });
            }
        })
        .catch(err => {
            console.error('Caught %o', err);
            res.status(500).json({
                message: "Failure"
            });
        });
})

module.exports = router;
