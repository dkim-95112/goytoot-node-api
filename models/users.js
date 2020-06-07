const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

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
    createDate: {
        type: String,
        required: true,
    }
});
userSchema.plugin(uniqueValidator);
module.exports = userSchema;
