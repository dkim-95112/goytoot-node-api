const debug = require('debug')('trymongo:toots:ctl');
exports.list = (req, res) => {
    const Toot = req.app.locals.mongoose.model('Toot');
    Toot.find().then(docs => {
        debug('Found docs: %o', docs.length);
        res.status(200).json({
            status: "Success",
            docs,
        })
    }).catch(err => {
        debug('Finding docs caught: %o', err);
        res.status(500).json({
            message: "Finding docs caught exception"
        })
    })
}
exports.insert = (req, res) => {
    debug('Inserting req body: %o', req.body);
    const Toot = req.app.locals.mongoose.model('Toot');
    const newToot = new Toot({
        bodyText: req.body.bodyText,
        creator: req.session.userId,
        createDate: (new Date).toISOString(),
        displayName: req.session.displayName,
    });
    newToot.save().then(insertedToot => {
        debug('Inserted toot: %o', insertedToot);
        res.status(201).json({
            status: "Success",
            doc: insertedToot
        });
    }).catch(err => {
        debug('Inserting caught: %o', err)
        res.status(500).json({
            message: 'Inserting caught exception'
        });
    });
}
exports.delete = (req, res) => {
    debug('Deleting id: %o', req.params.id);
    const Toot = req.app.locals.mongoose.model('Toot');
    Toot.deleteOne({
        _id: req.params.id,
        creator: req.session.userId,
    }).then(result => {
        if (result.n > 0) {
            return res.status(200).json({
                status: "Success"
            });
        }
        res.status(401).json({
            message: 'Zero docs deleted. Authorized ?',
        });
    }).catch(err => {
        debug('Deleting caught %o', err);
        res.status(500).json({
            message: 'Deleting caught exception'
        });
    });
}
