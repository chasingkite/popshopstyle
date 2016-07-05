'use strict';


let config = require('../../config'),
    crypto = require('../crypto'),
    model = require('../../mvc/models'),
    moment = require('moment'),
    redis = require('../redis'),
    util = require('util'),
    hitsPerDay = (res, key) => {

        return new Promise ((yes, no) => {

            let allowedHitsPerDay = config.api.hits.perDay,
                secondsToMidNight = moment().endOf('day').unix() - moment().unix();

            redis.client.get(redis.storageKey('HITS', key), (err, reply) => {

                if (!reply) {
                    reply = 1;
                    redis.client.set(redis.storageKey('HITS', key), 1, 'EX', secondsToMidNight);
                } else if (reply <= allowedHitsPerDay) {
                    redis.client.incr(redis.storageKey('HITS', key));
                } else if (reply > allowedHitsPerDay) {
                    return no({ code: '400.10' });
                }

                res.setHeader('X-Requests-made', reply);
                res.setHeader('X-Requests-left', allowedHitsPerDay - reply);

                yes();
            });
        });
    },
    computeSignature = (session, req, next) => {

        let clientToken = req.get('authorization').slice(0, 44),
            clientTime = req.get('authorization').slice(44, 54),
            clientSignature = req.get('authorization').slice(54, 98),
            dataToHash = (Object.keys(req.body).length) ? JSON.stringify(req.body) : req.originalUrl,
            md5Checksum = crypto.hash(dataToHash, 'md5', 'hex'),
            signatureString = util.format('%s|%s|%s|%s', req.method, req.originalUrl, md5Checksum, clientTime),
            signature = crypto.hmac(signatureString, 'sha256', 'base64', session.secret);

        console.log(dataToHash);

        if (signature === clientSignature) {
            req.currentSession = {
                userId: session.user._id.toString(),
                username: session.user.username,
                token: session.token,
                status: session.user.meta.status
            };

            /**
             * @see redis.keyExpiration()
             */
            redis.client.set(redis.storageKey(clientToken), JSON.stringify(session), 'EX', redis.keyExpiration());

            return next();
        }

        return next({ status: 403, code: 12 });
    },
    checkSignature = (req, res, next) => {

        let clientToken = req.get('authorization').slice(0, 44);

        hitsPerDay(res, clientToken).then(() => {
            redis.client.get(redis.storageKey(clientToken), (err, reply) => {
                if (err || !reply) {

                    /**
                     * Populate the user in the session in order to get more properties
                     * which could be stored in req.currentSession for later reference/use.
                     *
                     * This will happen at most once every two hours, unless a related change in the
                     * user profile occurs.
                     *
                     * @see signature.compute()
                     * @see redis.keyExpiration()
                     */
                    model.userSession
                        .findOne({ token: clientToken })
                        .populate([{ path: 'user', select: 'username meta' }])
                        .lean()
                        .exec((error, session) => {
                            if (error) {
                                return next(error);
                            }

                            if (!session) {
                                return next({ status: 403, code: 10 });
                            }

                            computeSignature(session, req, next);
                        });
                } else {
                    computeSignature(JSON.parse(reply), req, next);
                }
            });
        }).catch(next);
    };

module.exports = (req, res, next) => {

    if (!req.get('authorization')) {
        return next({ status: 403, code: 10 });
    }

    let serverTime = Math.floor(new Date() / 1000),
        clientTime = req.get('authorization').slice(44, 54);

    if ((serverTime - config.api.hits.timeOut) > clientTime) {
        return next({ status: 403, code: 11 });
    }

    return checkSignature(req, res, next);
};