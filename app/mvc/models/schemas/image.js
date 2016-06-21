'use strict';


var flat = require('flat');

module.exports = mongoose => {

    var Schema = mongoose.Schema,
        schema = new Schema(
            {
                author: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                description: {
                    type: String
                },
                image: {
                    type: String,
                    default: ''
                },
                location: {
                    type: {
                        type: String
                    },
                    coordinates: [Number]
                },
                tally: {
                    respect: {
                        type: Number,
                        default: 0
                    }
                },
                tags: [String],
                mentions: [String],
                meta: {
                    status: {
                        type: String,
                        default: 'active'
                    },
                    createdOn: {
                        type: Date,
                        default: Date.now
                    },
                    flags: [
                        {
                            author: {
                                type: Schema.Types.ObjectId,
                                ref: 'User',
                                required: true
                            },
                            createdOn: {
                                type: Date,
                                default: Date.now
                            }
                        }
                    ]
                }
            },
            {
                strict: true,
                versionKey: false
            }
        );

    /**
     * Since MongoDB does not allow empty coordinates, this pre-hook just unsets the
     * whole property in case no coordinates where given.
     */
    schema.pre('save', function (next) {
        if (Array.isArray(this.location.coordinates) && !this.location.coordinates.length) {
            this.location = undefined;
        }

        next();
    });

    /**
     * Flatten the update object so nested properties are
     * correctly updated instead of overwriting the parent object.
     */
    schema.pre('findOneAndUpdate', function () {
        this._update = flat(this._update);
    });


    return mongoose.model('Brag', schema, 'brags');
};
