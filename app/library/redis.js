'use strict';


let config = require('../config'),
    url = require('url'),
    redis = require('redis'),
    redisURL = url.parse(config.redis.url),
    redisPass = redisURL.auth.split(':')[1],
    redisClient = redis.createClient(redisURL.port, redisURL.hostname, { no_ready_check: true }),
    storageKey = function redis$storageKey() {
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

if (redisPass) {
    redisClient.auth(redisPass);
}
module.exports = {

    client: redisClient,

    storageKey: storageKey,

    keyExpiration: keyExpiration,

    flushSessions: session => {

        redisClient.del(storageKey('HITS', session.token));
        redisClient.del(storageKey(session.token));
    }
};