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
                avatar: {
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
                        default: ''
                    },
                    last: {
                        type: String,
                        default: ''
                    }
                },
                socialAccounts: {
                    facebook: {
                        userId: {
                            type: String,
                            trim: true,
                            default: ''
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
                meta: {
                    status: {
                        type: String,
                        default: 'pending'
                    },
                    memberSince: {
                        type: Date,
                        default: Date.now
                    },
                    lastLogin: {
                        type: Date,
                        default: Date.now
                    },
                    salt: {
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

    /**
     * Flatten the update object so nested properties are
     * correctly updated instead of overwriting the parent object.
     */
    schema.pre('findOneAndUpdate', function () {
        this._update = flat(this._update);
    });

    return mongoose.model('User', schema, 'users');
};
