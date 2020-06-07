'use strict';
const debug = require('debug')('trymongo:users:ctl');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.list = (req, res, next) => {
    debug('get users')
    res.send('not implemented yet');
}
exports.login = (req, res) => {
    debug('login: %o', req.body);
    const User = req.app.locals.mongooseService.getUserModel();
    let fetchedUser;
    User.findOne({email: req.body.email}).then(user => {
        if (!user) {
            return false;
        }
        fetchedUser = user;
        return bcrypt.compare( // async
            req.body.password, user.passwordHash
        )
    }).then(isPasswordVerified => {
        if (!isPasswordVerified) {
            return res.status(200).json({
                status: "Failure",
                messages: ['Invalid email/password'],
            });
        }
        const token = jwt.sign({
                // For subsequent database insert/delete, etc.
                userId: fetchedUser._id,
                displayName: fetchedUser.displayName,
            },
            process.env.JWT_KEY,
            {
                expiresIn: "2h"
            });
        res.status(200).json({
            status: 'Success',
            userId: fetchedUser._id,
            email: fetchedUser.email,
            displayName: fetchedUser.displayName,
            createDate: fetchedUser.createDate,
            token,
            expiresInSeconds: 2 * 3600,
        });
    }).catch(err => {
        debug('login error: %o', err.message)
        return res.status(500).json({
            message: 'login caught exception'
        });
    });
}
exports.signup = (req, res, next) => {
    debug('signup: %o', req.body);
    const User = req.app.locals.mongooseService.getUserModel();
    bcrypt.hash(req.body.password, 10).then(hash => {
        const newUser = new User({
            displayName: req.body.displayName,
            email: req.body.email,
            passwordHash: hash,
            createDate: (new Date).toISOString(),
        })
        newUser.save().then(result => {
            res.status(201).json({
                status: 'Success',
                result
            })
        }).catch(err => {
            const messages = Object.entries(err.errors).map(
                ([k, v]) => v.message
            );
            debug('signup errors:\n%o', messages);
            res.status(200).json({
                status: 'Failure',
                messages,
            })
        })
    })
}
exports.checkAuthHeader = (req, res, next) => {
    try {
        const token = req.headers.authorization
            // Expecting "Authorization: Bearer [token]"
            .split(' ').pop();
        const decodedToken = jwt.verify(
            token, process.env.JWT_KEY
        );
        req.userData = {
            // For subsequent insert/delete, etc.
            userId: decodedToken.userId,
            displayName: decodedToken.displayName,
        }
        next();
    } catch (err) {
        debug('checkAuthHeader caught error: %o', err);
        res.status(401).json({
            message: 'checkAuthHeader caught exception'
        });
    }
}

