'use strict';


let model = require('../models'),
    format = require('./helpers/format'),
    userHelper = require('./helpers/user'),
    deNull = data => {
        for (let k = 0; k < Object.keys(data).length; k += 1) {
            let property = Object.keys(data)[k];
            if (data.hasOwnProperty(property)) {
                if (typeof data[property] === 'object' && data[property] !== null) {
                    deNull(data[property]);
                } else if (data[property] === null) {
                    data[property] = '';
                }
            }
        }

        return data;
    },
    profile = {

        auth: {

            login: (req, res, next) => {

                userHelper.login({ username: req.body.username, password: req.body.password }).then(session => {
                    res.send({
                        token: session.token,
                        secret: session.secret
                    });
                }).catch(next);
            },

            logout: (req, res, next) => {

                userHelper.logout(req.currentSession).then(() => {
                    res.status(200).end();
                }).catch(next);
            }
        },

        create: (req, res, next) => {

            userHelper.create(req).then(account => {
                res.send(account);
            }).catch(next);
        },

        read: (req, res, next) => {

            req.params.username = req.params.username.toLowerCase();
            let username = req.params.username === 'me' ? req.currentSession.username : req.params.username,
                account = model.user.findOne({ username: username }).lean().exec();

            account.then(user => {
                if (!user) {
                    return next({ code: 11 });
                }

                res.send(format.user(user));
            }).catch(next);
        },

        update: (req, res, next) => {

            let options = {
                new: true,
                runValidators: true
            };

            if (req.body.dateOfBirth === null) {
                options.$unset = { 'dateOfBirth': '' };
                delete req.body.dateOfBirth;
            } else if (req.body.dateOfBirth) {
                req.body.dateOfBirth = parseInt(req.body.dateOfBirth) * 1000;
            }

            /**
             * req.internalQuery, for internal use only gets set on account.activate()
             */
            let query = req.internalQuery || { username: req.currentSession.username },
                account = model.user.findOneAndUpdate(query, deNull(req.body), options).lean().exec();

            account.then(user => {
                if (!user) {
                    throw new Error({ code: 11 });
                }

                res.send(format.user(user));
            }).catch(next);
        },

        delete: (req, res, next) => {

            /**
             * TODO
             */
            model.user.delete(req.currentSession.userId, (error, user) => {
                if (error) {
                    return next(error);
                }

                /**
                 * "Sorry to see you go" email notification.
                 */
                mandrill.accountEmail({
                    email: user.email,
                    username: user.username,
                    type: 'goodbye'
                });

                redis.flushSessions(req.currentSession);
                res.status(200).end();
            });
        },

        settings: {

            read: (req, res, next) => {

                let query = { _id: req.currentSession.userId },
                    settings = model.user.findOne(query).select('socialAccounts notifications').lean().exec();

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

                model.user.findOneAndUpdate(query, req.body, options).then(() => {
                    res.status(200).end();
                }).catch(next);
            }
        }
    };

module.exports = profile;
