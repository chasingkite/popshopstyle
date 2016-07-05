'use strict';


module.exports = mongoose => {

    let Schema = mongoose.Schema,
        schema = new Schema(
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                token: {
                    type: String,
                    required: true
                },
                secret: {
                    type: String,
                    required: true
                },
                meta: {
                    created: {
                        type: Date,
                        default: Date.now
                    }
                }
            },
            {
                strict: true,
                versionKey: false
            }
        );

    schema.pre('remove', next => {
        next();
    });


    return mongoose.model('Session', schema, 'userSessions');
};
