const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const resetPasswordTokenSchema = new mongoose.Schema({
  hash: {
    // Now sha256 (email & date ISO string) base64 encoded
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  dateISO: {
    type: String,
    required: true,
  },
});
resetPasswordTokenSchema.plugin(uniqueValidator);
module.exports = resetPasswordTokenSchema;