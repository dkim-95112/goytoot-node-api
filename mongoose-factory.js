"use strict";
const mongoose = require('mongoose');
const tootSchema = require('./models/toots');
const userSchema = require('./models/users');
const resetPasswordTokenSchema = require('./models/reset-password-token');
const debug = require('debug')('trymongo:mongoose.debug');
const info = require('debug')('trymongo:mongoose.info'); // Enabling always ?

function mongooseFactory(
  url = 'mongodb+srv://atlasadmin:atlasadmin@cluster0-910s3.mongodb.net/?retryWrites=true&w=majority',
  options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, // Avoids some deprecation warnings ?
    useFindAndModify: false,
    //autoIndex: false, // Don't build indexes
    poolSize: 5, // 10, // Maintain up to 10 socket connections
    //serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 30000, // 45000, // Close sockets after 45 seconds of inactivity
    //family: 4 // Use IPv4, skip trying IPv6
  },
) {
  mongoose.connection.on('connecting', () => { // Testing
    info('connecting')
  })
  info('Attempting connect url: ', url);
  return mongoose.connect(url, options).then(() => {
    info('connected');
    const db = mongoose.connection; // Only 1 connection now
    db.on('error', console.error.bind(
      console, 'mongoose error'
    ));
    db.on('close', () => {
      // Assuming 1 connection now
      db.removeAllListeners();
    })
    db.on('disconnecting', function () {
      debug('disconnecting');
    });
    db.on('disconnected', function () {
      info('disconnected');
    });
    db.on('reconnected', function () {
      info('reconnected');
    });
    db.on('reconnectFailed', function () {
      info('reconnectFailed');
    });
    db.on('all', function () {
      info('all');
    });
    // Setting up before connecting now
    db.model('User', userSchema)
    db.model('Toot', tootSchema);
    db.model('ResetPasswordToken', resetPasswordTokenSchema);
    // Watching toots and pushing changes to clients
    const tw = mongoose._tootWatch = db.model('Toot').watch();
    tw.on('change', function (change) {
      info('toot change: %o', change);
    })
    tw.on('error', function (err) {
      console.log('toot err: %o', err);
    })
    tw.on('close', function () {
      console.log('toot close');
      tw.removeAllListeners()
    })
    tw.on('end', function () {
      console.log('toot end');
    })
    return mongoose;
  }).catch(err => {
    console.error(err)
  })
}

module.exports = mongooseFactory;
