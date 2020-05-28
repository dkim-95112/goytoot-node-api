const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
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
    let fetchedUser;
    User.findOne({email: req.body.email}).then(user => {
        if (!user) {
            return false;
        }
        fetchedUser = user;
        return bcrypt.compare(
            req.body.password, user.password
        );
    }).then(result => {
        if (!result) {
            return res.status(401).json({
                message: "Failure"
            });
        }
        const token = jwt.sign({
                email: fetchedUser.email,
                userId: fetchedUser._id,
            },
            process.env.JWT_KEY,
            {
                expiresIn: "1h"
            });
        res.status(200).json({
            token,
            expiresInSeconds: 3600,
            userId: fetchedUser._id
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
            password: hash,
            email: req.body.email,
        })
        newUser.save().then(result => {
            res.status(201).json({
                message: 'User created',
                result
            })
        }).catch(err => {
            console.error(
                'signup errors:\n%o',
                Object.entries(err.errors)
                    .map(entry => entry.join(': '))
                    .join('\n')
            );
            res.status(500).json({
                message: 'Invalid email/password',
            })
        })
    })
}
exports.checkAuthHeader = (req, res, next) => {
    try {
        const token = req.headers.authorization
            // Expecting "Authorization: Bearer token"
            .split(' ').pop();
        const decodedToken = jwt.verify(
            token, process.env.JWT_KEY
        );
        req.userData = {
            email: decodedToken.email,
            userId: decodedToken.userId,
        }
        next();
    } catch (err) {
        res.status(401).json({
            message: 'You are not authenticated!'
        });
    }
}

