'use strict';


let config = require('../config'),
    Hashids = require('hashids'),
    hashids = new Hashids(config.keys.api, 18);

module.exports = {

    encode: string => {
        return hashids.encodeHex(string);
    },

    decode: hash => {
        return hashids.decodeHex(hash) || null;
    }
};