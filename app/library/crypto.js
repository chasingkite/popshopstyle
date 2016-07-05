'use strict';


let crypto = require('crypto'),
    config = require('../config');

module.exports = {

    bytes: (length, encoding) => {

        return new Promise ((yes, no) => {
            crypto.randomBytes(length, (err, bytes) => {
                if (err) {
                    return no(err);
                }

                yes(bytes.toString(encoding || 'base64'));
            });
        });
    },

    hmac: (data, hash, encoding, key) => {

        hash = hash || 'RSA-SHA512';
        encoding = encoding || 'base64';
        key = key || config.keys.api;

        return crypto.createHmac(hash, key).update(data).digest(encoding);
    },

    hash: (data, hash, encoding) => {

        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }

        hash = hash || 'RSA-SHA512';
        encoding = encoding || 'base64';

        return crypto.createHash(hash).update(data, 'utf8').digest(encoding);
    }

};