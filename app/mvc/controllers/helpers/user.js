'use strict';


let model = require('../../models'),
    redis = require('../../../library/redis'),
    crypto = require('../../../library/crypto'),
    weaver = require('../../../library/weaver'),
    mandrill = require('../../../library/mandrill'),
    session = user => {

        return new Promise((yes, no) => {

            crypto.bytes(256).then(bytes => {
                bytes += user.password;

                let session = {
                    user: user._id,
                    token: crypto.hmac(bytes, 'sha256'),
                    secret: crypto.hmac(bytes)
                };

                yes(model.userSession.create(session));
            }).catch(() => {
                no(false);
            });
        });
    },
    login = credentials => {

        return new Promise((yes, no) => {

            let query = {
                    username: credentials.username.toLowerCase(),
                    'meta.status': { $ne: 'deleted' }
                },
                update = { 'meta.lastLogin': new Date() },
                login = model.user.findOneAndUpdate(query, update);

            login.then(user => {
                if (!user) {
                    return no({ status: 401, code: 11 });
                }

                if (crypto.hmac(weaver([credentials.password, user.meta.salt])) !== user.password) {
                    return no({ status: 401, code: 12 });
                }

                yes(session(user));
            }).catch(no);
        });
    },
    getId = username => {

        return new Promise ((yes, no) => {

            if (username === 'me') {
                return yes('me');
            }

            model.user.findOne({ username: username }).select('_id').lean().exec().then(user => {
                if (!user) {
                    return no({ code: '404.11' });
                }

                yes(user._id);
            }).catch(no);
        });
    };

module.exports = {

    create: req => {

        let userPassword = req.body.password;

        return new Promise ((yes, no) => {
            crypto.bytes(128).then(bytes => {
                let salt = crypto.hmac(bytes);

                req.body.password = crypto.hmac(weaver([req.body.password, salt]));
                req.body.meta = {
                    salt: salt,
                    status: 'active'
                };

                // TODO: Check for errors on existing username or email
                return model.user.create(req.body);

            }).then(function () {

                mandrill.accountEmail({
                    email: req.body.email,
                    username: req.body.username,
                    token: req.body.meta.token,
                    type: 'welcome'
                });

                return login({ username: req.body.username, password: userPassword });
            }).then(session => {
                yes({
                    token: session.token,
                    secret: session.secret
                });
            }).catch(no);
        });
    },

    login: login,

    logout: session => {

        return new Promise((yes, no) => {
            model.userSession.remove({ 'token': session.token }, error => {
                if (error) {
                    return no(error);
                }

                redis.client.del(redis.storageKey(session.token));
                yes();
            });
        });
    },

    getId: getId
};
