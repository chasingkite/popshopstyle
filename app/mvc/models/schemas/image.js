'use strict';


let flat = require('flat');

module.exports = mongoose => {

    let Schema = mongoose.Schema,
        schema = new Schema(
            {
                owner: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                description: {
                    type: String,
                    default: '',
                    trim: true
                },
                fileName: {
                    type: String,
                    default: '',
                    trim: true
                },
                attributes: {
                    price: {
                        type: Number,
                        required: true
                    },
                    style: [String],
                    colors: [String],
                    sizes: [String]
                },
                location: {
                    type: {
                        type: String,
                        required: true
                    },
                    coordinates: [Number]
                },
                tags: [String],
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
     * Since MongoDB does not allow empty coordinates, this pre-hook just "unsets" the
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


    return mongoose.model('Image', schema, 'images');
};
