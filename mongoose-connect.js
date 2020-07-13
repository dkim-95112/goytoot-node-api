'use strict';
const mongoose = require('mongoose');
const tootSchema = require('./models/toots');
const userSchema = require('./models/users');
const debug = require('debug')('trymongo:mongoose');
const info = require('debug')('trymongo:mongoose*'); // Enabling always ?

class MongooseService {
    #myMongoose;
    #Toot;
    #User;
    #tootChangeStream;

    connect() {
        const url = 'mongodb+srv://atlasadmin:atlasadmin@cluster0-910s3.mongodb.net/?retryWrites=true&w=majority';
        info('Attempting to connect url: ', url)
        return mongoose.connect(
            url,
            //'mongodb://localhost/test',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true, // Avoids some deprecation warnings ?
                //useFindAndModify: false,
                //autoIndex: false, // Don't build indexes
                poolSize: 5, // 10, // Maintain up to 10 socket connections
                //serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
                socketTimeoutMS: 30000, // 45000, // Close sockets after 45 seconds of inactivity
                //family: 4 // Use IPv4, skip trying IPv6
            }
        ).then(myMongoose => {
            this.#myMongoose = myMongoose;
            const db = myMongoose.connections[0]; // Assuming only 1
            db.on('connected', function () {
                info('connected');
            });
            db.on('error', console.error.bind(
                console, 'mongoose error'
            ));
            db.on('disconnected', function () {
                console.log('mongoose disconnected');
            });
            db.on('reconnected', function () {
                console.log('mongoose reconnected');
            });
            db.on('reconnectFailed', function () {
                console.log('mongoose reconnectFailed');
            });
            db.on('all', function () {
                console.log('mongoose all');
            });
            this.#Toot = db.model(
                'Toot', tootSchema
            );
            const cs = this.#tootChangeStream = this.#Toot.watch();
            // cs.on('change', function (change) {
            //     console.log('toot change: %o', change);
            // })
            cs.on('error', function (err) {
                console.log('toot err: %o', err);
            })
            cs.on('close', function () {
                console.log('toot close');
            })
            cs.on('end', function () {
                console.log('toot end');
            })
            this.#User = db.model('User', userSchema);
        })
    }

    getTootModel() {
        return this.#Toot;
    }

    getUserModel() {
        return this.#User;
    }

    getTootChangeStream() {
        return this.#tootChangeStream
    }

    close() {
        this.#myMongoose.connections.forEach(conn => {
            conn.removeAllListeners();
            conn.close();
        })
    }
}

module.exports = MongooseService;
