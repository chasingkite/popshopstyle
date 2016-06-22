'use strict';


let m = require('../../models'),
    redis = require('../../../library/redis'),
    crypto = require('../../../library/crypto'),
    session = user => {

        return new Promise((yes, no) => {

            crypto.bytes(256)
                .then(bytes => {
                    bytes += user.socialAccounts.facebook.userId;
                    yes(m.userSession.create({
                        user: user._id,
                        token: crypto.hmac(bytes, 'sha256'),
                        secret: crypto.hmac(bytes)
                    }));

                    // TODO: Update meta.lastLogin property.
                })
                .catch(no);
        });
    },
    getId = username => {

        return new Promise((yes, no) => {

            if (username === 'me') {
                return yes('me');
            }

            m.user.findOne({ username: username }).select('_id')
                .lean()
                .exec()
                .then(user => {
                    if (!user) {
                        return no({ code: '404.11' });
                    }
                    yes(user._id);
                })
                .catch(no);
        });
    };

module.exports = {

    create: body => {

        return new Promise ((yes, no) => {
            crypto.bytes(128).then(bytes => {
                body.meta = {
                    salt: crypto.hmac(bytes),
                    status: 'active'
                };

                // TODO: Check for errors on existing username or email
                return m.user.create(body);
            })
                .then(user => {

                    // TODO: Send welcome email
                    return session(user);
                })
                .then(yes)
                .catch(no);
        });
    },

    logout: session => {

        return new Promise((yes, no) => {
            m.userSession.remove({ 'token': session.token }, error => {
                if (error) {
                    return no(error);
                }

                redis.client.del(redis.storageKey(session.token));
                yes();
            });
        });
    },

    session: session,

    getId: getId
};
