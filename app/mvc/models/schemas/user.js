'use strict';


let flat = require('flat'),
    setEmptyToNull = data => {
        for (let k = 0; k < Object.keys(data).length; k += 1) {
            let property = Object.keys(data)[k];
            if (data.hasOwnProperty(property)) {
                if (typeof data[property] === 'object' && data[property] !== null) {
                    setEmptyToNull(data[property]);
                } else if (!data[property]) {
                    data[property] = null;
                }
            }
        }
    };

module.exports = mongoose => {

    let Schema = mongoose.Schema,
        schema = new Schema(
            {
                username: {
                    type: String,
                    trim: true,
                    lowercase: true,
                    required: true
                },
                email: {
                    type: String,
                    trim: true,
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
                    default: null
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

        if (this._update.dateOfBirth) {
            this._update.dateOfBirth = parseInt(this._update.dateOfBirth, 10) * 1000;
        }

        if (this._update.name && !Object.keys(this._update.name).length) {
            delete this._update.name;
        }

        setEmptyToNull(this._update);
        this._update = flat(this._update);
    });

    return mongoose.model('User', schema, 'users');
};
