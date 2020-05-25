const mongoose = require('mongoose');
const tootSchema = new mongoose.Schema({
    bodyText: String
});
module.exports = mongoose.model('Toot', tootSchema);
