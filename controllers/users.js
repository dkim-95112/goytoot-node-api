const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true,
        // unique: true, // time being allow duplicates
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
});
userSchema.plugin(uniqueValidator);
const User = mongoose.model('User', userSchema);

exports.list = (req, res, next) => {
    console.log('get users')
    res.send('respond with a resource');
}
exports.login = (req, res) => {
    console.log('login: %o', req.body);
    User.findOne({email: req.body.email}).then(user => {
        if (!user) {
            return false;
        }
        return {
            user,
            isPasswordVerified: bcrypt.compare(
                req.body.password, user.password
            ),
        };
    }).then(({user, isPasswordVerified}) => {
        if (!isPasswordVerified) {
            return res.status(401).json({
                message: "Failure"
            });
        }
        const token = jwt.sign({
                // For subsequent database insert/delete, etc.
                userId: user._id,
            },
            process.env.JWT_KEY,
            {
                expiresIn: "1h"
            });
        res.status(200).json({
            userId: user._id,
            email: user.email,
            displayName: user.displayName,
            token,
            expiresInSeconds: 3600,
        });
    }).catch(err => {
        return res.status(500).json({
            message: "Caught: " + JSON.stringify(err)
        });
    });
}
exports.signup = (req, res, next) => {
    console.log('signup: %o', req.body);
    bcrypt.hash(req.body.password, 10).then(hash => {
        const newUser = new User({
            displayName: req.body.displayName,
            email: req.body.email,
            passwordHash: hash,
        })
        newUser.save().then(result => {
            res.status(201).json({
                status: 'Success',
                messages: ['User created'],
                result
            })
        }).catch(err => {
            const messages = Object.entries(err.errors).map(
                ([k, v]) => v.message
            );
            console.error('signup errors:\n%o', messages);
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
        }
        next();
    } catch (err) {
        res.status(401).json({
            message: 'You are not authenticated!'
        });
    }
}

