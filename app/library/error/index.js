'use strict';


let errors = require('./errors.json');

/**
 * Custome error
module.exports = function iBrag(body) {

    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.status = body.status || 404;
    this.code = body.code || 10;
    this.message = body.message || '';
};
require('util').inherits(module.exports, Error);
*/


module.exports = (error, req, res, next) => {

    let status = error.status || 404,
        code = error.code || 10;

    if (error.name === 'MongoError') {
        status = 400;

        if (error.message.indexOf('users.$username_1 dup key') > 0) {
            code = 15;
        }

        if (error.message.indexOf('users.$email_1 dup key') > 0) {
            code = 18;
        }
    }

    res.status(status).send({
        status: status,
        code: code,
        message: errors[status][code] || error.message,
    });

    error = null;
    next = null;
};