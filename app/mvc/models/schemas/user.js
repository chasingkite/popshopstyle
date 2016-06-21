'use strict';


var flat = require('flat');

module.exports = mongoose => {

    var Schema = mongoose.Schema,
        schema = new Schema(
            {
                username: {
                    type: String,
                    lowercase: true,
                    required: true
                },
                email: {
                    type: String,
                    lowercase: true,
                    required: true
                },
                password: {
                    type: String,
                    required: true
                },
                avatar: {
                    type: String,
                    trim: true,
                    default: ''
                },
                website: {
                    type: String,
                    trim: true,
                    lowercase: true,
                    default: ''
                },
                about: {
                    type: String,
                    trim: true,
                    default: ''
                },
                dateOfBirth: {
                    type: Date
                },
                gender: {
                    type: String,
                    default: ''
                },
                name: {
                    first: {
                        type: String,
                        trim: true,
                        default: ''
                    },
                    last: {
                        type: String,
                        trim: true,
                        default: ''
                    }
                },
                socialAccounts: {
                    google: {
                        token: {
                            type: String,
                            trim: true,
                            default: ''
                        },
                        autoPost: {
                            type: Boolean,
                            default: false
                        }
                    },
                    facebook: {
                        token: {
                            type: String,
                            trim: true,
                            default: ''
                        },
                        autoPost: {
                            type: Boolean,
                            default: false
                        }
                    },
                    twitter: {
                        token: {
                            type: String,
                            trim: true,
                            default: ''
                        },
                        autoPost: {
                            type: Boolean,
                            default: false
                        }
                    }
                },
                notifications: {
                    email: {
                        type: Boolean,
                        default: true
                    },
                    push: {
                        type: Boolean,
                        default: false
                    }
                },
                tally: {
                    brags: {
                        type: Number,
                        default: 0
                    },
                    respect: {
                        type: Number,
                        default: 0
                    },
                    followers: {
                        type: Number,
                        default: 0
                    },
                    followees: {
                        type: Number,
                        default: 0
                    }
                },
                meta: {
                    status: {
                        type: String,
                        default: 'pending'
                    },
                    memberSince: {
                        type: Date,
                        default: Date.now
                    },
                    lastUpdate: {
                        type: Date
                    },
                    lastLogin: {
                        type: Date,
                        default: Date.now
                    },
                    salt: {
                        type: String,
                        trim: true,
                        default: null
                    },
                    pin: {
                        type: String,
                        trim: true,
                        default: null
                    }
                }
            },
            {
                strict: true,
                versionKey: false
            }
        );

    schema.statics = {

        delete: function (userId, callback) {

            let update = {
                'meta.status': 'deleted',
                'meta.updated': new Date()
            };

            this.findOneAndUpdate({ '_id': userId }, update, (error, userRecord) => {
                if (error) {
                    return callback(error);
                }

                let query = { user: userId };
                let update = { 'meta.status': 'deleted', 'meta.updated': new Date() };

                async.parallel(
                    [
                        done => {
                            model.photo.find(query, { select: '_id' }).lean().exec((err, photos) => {
                                var ids = photos.map(photo => {
                                    return photo._id;
                                });
                            });
                        },
                        done => {
                            model.followee.remove(query, err => {
                                done(err);
                            });
                        },
                        done => {
                            model.followee.update({}, { $pull: { followees: query }}, { multi: true }, err => {
                                done(err);
                            });
                        },
                        model.photo.update.bind(model.photo, query, update, { multi: true }),
                        model.comment.remove.bind(model.comment, query),
                        model.session.remove.bind(model.session, query)
                    ],
                    error => {
                        callback(error, userRecord);
                    }
                );
            });
        }
    };

    /**
     * Flatten the update object so nested properties are
     * correctly updated instead of overwriting the parent object.
     */
    schema.pre('findOneAndUpdate', function () {
        this._update = flat(this._update);
    });


    return mongoose.model('User', schema, 'users');
};
