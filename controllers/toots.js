const Toot = require('../models/toots');

exports.list = (req, res) => {
    Toot.find().then(docs => {
        console.log('Found docs: %o', docs);
        res.status(200).json({
            message: "Success",
            docs,
        })
    }).catch(err => {
        console.error('Caught: %o', err);
        res.status(500).json({
            message: "Failure"
        })
    })
}
exports.insert = (req, res) => {
    console.log('Inserting req body: %o', req.body);
    const newToot = new Toot({
        bodyText: req.body.bodyText
    });
    newToot.save().then(insertedToot => {
        console.log('Inserted toot: %o', insertedToot);
        res.status(201).json({
            message: "Success",
            doc: insertedToot
        });
    }).catch(err => {
        console.error('Caught: %o', err)
        res.status(500).json({
            message: "Failure"
        });
    });
}
exports.delete = (req, res) => {
    console.log('Deleting id: %o', req.params.id);
    Toot.deleteOne({_id: req.params.id}).then(result => {
        if (result.n > 0) {
            return res.status(200).json({
                message: "Success"
            });
        }
        res.status(401).json({
            message: "Not authorized ?"
        });
    }).catch(err => {
        console.error('Caught %o', err);
        res.status(500).json({
            message: "Failure"
        });
    });
}
