const mongoose = require('mongoose');
module.exports = new mongoose.Schema({
    bodyText: String,
    creator: String,
    createDate: String,
    displayName: String,
});
// module.exports = mongoose.model('Toot', tootSchema);
