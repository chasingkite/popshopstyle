'use strict';


let fb = require('fb'),
    m = require('../models'),
    format = require('./helpers/format'),
    userHelper = require('./helpers/user');

module.exports = {

    auth: {

        login: (req, res, next) => {

            let fbQuery = {
                fields: 'id,first_name,last_name,birthday,gender',
                access_token: req.body.facebookToken
            };

            fb.api('me', fbQuery, function (fbUser) {
                if (!fbUser || fbUser.error) {
                    return next(fbUser.error);
                }

                m.user.findOne({
                        'socialAccounts.facebook.userId': fbUser.id,
                        'meta.status': 'active'
                    })
                    .lean()
                    .exec()
                    .then(user => {
                        if (!user) {
                            let dt = fbUser.birthday.split('/');
                            return userHelper.create({
                                username: req.body.username,
                                email: req.body.email,
                                dateOfBirth: new Date(`${dt[2]}-${dt[0]}-${dt[1]}`).getTime(),
                                avatar: `https://graph.facebook.com/${fbUser.id}/picture?width=1800`,
                                socialAccounts: {
                                    facebook: {
                                        userId: fbUser.id
                                    }
                                },
                                name: {
                                    first: fbUser.first_name || undefined,
                                    last: fbUser.last_name || undefined
                                },
                                gender: fbUser.gender || undefined
                            });
                        }

                        return userHelper.session(user);
                    })
                    .then(session => {
                        res.send({
                            token: session.token,
                            secret: session.secret
                        });
                    })
                    .catch(next);
            });
        },

        logout: (req, res, next) => {

            userHelper.logout(req.currentSession).then(() => {
                res.status(200).end();
            }).catch(next);
        }
    },

    read: (req, res, next) => {

        req.params.username = req.params.username.toLowerCase();
        let username = req.params.username === 'me' ? req.currentSession.username : req.params.username,
            account = m.user.findOne({ username: username, 'meta.status': 'active' }).lean().exec();

        account.then(user => {
            if (!user) {
                return next({ code: 11 });
            }

            res.send(format.user(user, req.currentSession));
        }).catch(next);
    },

    readAll: (req, res, next) => {

        let query = { 'meta.status': 'active' };
        if (req.span) {
            query._id = req.span;
        }

        let accounts = m.user.find(query)
            .sort(req.sort)
            .limit(req.items)
            .lean()
            .exec();

        accounts.then(users => {
            if (!users.length) {
                return res.send({ data: [] });
            }

            format.users(users, req.currentSession);
            if (req.span && req.span.$gt) {
                users.reverse();
            }
            res.send({
                before: format.paging('before', req, users, 'userId'),
                after: format.paging('after', req, users, 'userId'),
                data: users
            });
        }).catch(next);
    },

    update: (req, res, next) => {

        let account = m.user
            .findOneAndUpdate(
                { username: req.currentSession.username },
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            )
            .lean()
            .exec();

        account.then(user => {
            if (!user) {
                throw new Error({ code: 11 });
            }

            res.send(format.user(user));
        }).catch(next);
    },

    delete: (req, res, next) => {

        let account = m.user
            .findOneAndUpdate(
                { username: req.currentSession.username },
                {
                    'meta': {
                        status: 'deleted',
                        deletedOn: Date.now()
                    }
                }
            )
            .lean()
            .exec();

        account.then(user => {
            if (!user) {
                throw new Error({ code: 11 });
            }

            /**
             * "Sorry to see you go" email notification.
             *
            mandrill.accountEmail({
                email: user.email,
                username: user.username,
                type: 'goodbye'
            });
             */

            userHelper.flushSessions(req.currentSession).then(() => {
                res.status(200).end();
            });
        }).catch(next);
    },

    settings: {

        read: (req, res, next) => {

            let query = { _id: req.currentSession.userId },
                settings = m.user.findOne(query).select('socialAccounts notifications').lean().exec();

            settings.then(settings => {
                settings._id = undefined;
                res.send(settings);
            }).catch(next);
        },

        update: (req, res, next) => {

            req.body.meta = {
                lastUpdate: new Date()
            };

            let query = { _id: req.currentSession.userId },
                options = { new: true, runValidators: true };

            m.user.findOneAndUpdate(query, req.body, options).then(() => {
                res.status(200).end();
            }).catch(next);
        }
    }
};
