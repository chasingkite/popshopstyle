'use strict';


let apiURL = 'http://localhost:' + process.env.PORT,
    async = require('async'),
    mongodb = require('mongodb'),
    config = require('../../app/config'),
    request = require('./request')(apiURL),
    tools = {

        db: {
            setup: function tools$setup() {

                return new Promise(function (yes, no) {

                    mongodb.MongoClient.connect(config.mongo.url, function (err, connection) {
                        if (err) {
                            return no('Error on DB connection');
                        }

                        console.log();
                        console.log('  ✓ Connected to database.');
                        tools.dbConnection = connection;
                        yes(tools.db.dropDatabase);
                    });
                });
            },

            dropDatabase: function tools$db$dropDatabase() {

                return new Promise(function (yes, no) {
                    let retryCount = 0;

                    function dropDb() {
                        tools.dbConnection.dropDatabase(function (error) {
                            if (error && error.code === 12586) {

                                retryCount += 1;

                                if (retryCount < 10) {
                                    console.info('Waiting 1 second for mongodb background processes to finish');
                                    return setTimeout(dropDb, 1000);
                                }
                            } else if (error) {
                                return no(error);
                            }

                            console.log('  ✓ Dropped database.');
                            yes(tools.db.buildIndexes);
                        });
                    }

                    dropDb();
                });
            },

            buildIndexes: function tools$db$buildIndexes() {

                return new Promise (function (yes, no) {
                    let dbIndexes = require('./dbIndexes.json');
                    async.each(dbIndexes, function (record, eachCallback) {

                        tools.dbConnection.collection(record.collection, function (err, collection) {
                            record.indexes.forEach(function (index) {
                                var field = {},
                                    unique = {
                                        unique: index.unique || false
                                    };

                                if (Array.isArray(index.field)) {
                                    index.field.forEach(function (innerField) {
                                        field[innerField] = index.type || 1;
                                    });
                                } else {
                                    field[index.field] = index.type || 1;
                                }

                                collection.createIndex(field, unique);
                            });

                            setTimeout(function () {
                                eachCallback();
                            }, 1000);
                        });

                    }, function (err) {
                        if (err) {
                            return no(err);
                        }

                        console.log('  ✓ Rebuilt indexes.');
                        console.log();
                        process.nextTick(function () {
                            yes();
                        });
                    });
                });
            },

            readRecord: function tools$db$readRecord(query, collection) {

                return new Promise (function (yes, no) {
                    tools.dbConnection.collection(collection, function (err, collection) {
                        collection.find(query).toArray(function (error, data) {
                            if (error) {
                                return no(error);
                            }

                            yes(data);
                        });
                    });
                });
            },

            objectId: function tools$db$objectId(id) {
                return new mongodb.ObjectID(id);
            }
        },

        request: request
    };

module.exports = tools;
