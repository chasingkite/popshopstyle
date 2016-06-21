'use strict';


let config = require('../config'),
    url = require('url'),
    redis = require('redis'),
    redisURL = url.parse(config.redis.url),
    redisClient = redis.createClient(redisURL.port, redisURL.hostname, { no_ready_check: true }),
    storageKey = () => {
        let argIndex,
            finalKey = [config.redis.keyPrefix];

        for (argIndex in arguments) {
            if (arguments.hasOwnProperty(argIndex)) {
                finalKey.push(arguments[argIndex]);
            }
        }

        return finalKey.join(':');
    },
    keyExpiration = () => {

        /**
         * The Redis key will expire in 2 hours.
         * @see config.redis.keyExpiration
         */
        return config.redis.keyExpiration;
    };

redisClient.auth(redisURL.auth.split(':')[1]);
module.exports = {

    client: redisClient,

    storageKey: storageKey,

    keyExpiration: keyExpiration,

    flushSessions: session => {

        redisClient.del(storageKey(session.token));
    }
};