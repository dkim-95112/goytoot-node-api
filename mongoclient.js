const util = require('util');
const assert = require('assert').strict;
const MongoClient = require('mongodb').MongoClient;

class MyMongoClient {
    #db;
    #mongoClient;
    tweets;

    constructor() {
        const uri = "mongodb+srv://atlasadmin:atlasadmin@cluster0-910s3.mongodb.net/?retryWrites=true&w=majority";
        this.#mongoClient = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    connect() {
        const dbName = 'anon';
        return this.#mongoClient.connect()
            .then(() => {
                console.log("Connected successfully to server");
                this.#db = this.#mongoClient.db(dbName);
                this.tweets = this.#db.collection('tweets');
            });
    }

    watchTweets(nConnections) {
        // start listen to changes
        const changeStream = this.tweets.watch();
        changeStream.on("change", function (change) {
            console.log('got change')
            console.log(change);
            nConnections.map(connection => {
                connection.send(JSON.stringify(change));
            });
        });
    }
}

module.exports = MyMongoClient;
