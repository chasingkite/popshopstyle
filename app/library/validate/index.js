'use strict';


let ajv = require('ajv')({
        removeAdditional: true,
        format: 'full'
    }),
    striptags = require('striptags'),
    validators = {

        headers: (req, res, next) => {

            let expectBody = ['PUT', 'POST'];
            if (expectBody.indexOf(req.method) >= 0 && !req.is('application/json')) {
                return next({ status: 400, code: 11 });
            }

            return next();
        },

        /**
         * Removes HTML entities for the request body.
         *
         * @param req
         * @param res
         * @param next
         * @returns {*}
         */
        sanitizeBody: (req, res, next) => {

            let sanitize = data => {
                for (let k in data) {
                    if (data.hasOwnProperty(k)) {
                        if (typeof data[k] === 'object' && data[k] !== null) {
                            sanitize(data[k]);
                        } else if (typeof data[k] === 'string') {
                            data[k] = striptags(data[k]);
                        }
                    }
                }
            };

            sanitize(req.body);
            return next();
        },

        auth: {

            login: (req, res, next) => {

                let schema = require('./schemas/user/login.json'),
                    validate = ajv.compile(schema),
                    valid = validate(req.body);

                if (!valid) {
                    let error = validate.errors[0];

                    if (error.dataPath === '.username' && (error.keyword === 'minLength' || error.keyword === 'maxLength')) {
                        return next({ status: 400, code: 16, message: error });
                    }

                    if (error.dataPath === '.email') {
                        return next({ status: 400, code: 17, message: error });
                    }

                    if (error.dataPath === '.facebookToken') {
                        return next({ status: 400, code: 17, message: error });
                    }
                }

                return next();
            }
        },

        profile: {

            update: (req, res, next) => {

                let schema = require('./schemas/user/update.json'),
                    validate = ajv.compile(schema),
                    valid = validate(req.body);

                if (!valid) {
                    let error = validate.errors[0];

                    if (error.dataPath === '.email' && error.keyword === 'format') {
                        return next({ status: 400, code: 17, message: error });
                    }

                    if (error.dataPath === '.avatar' && error.keyword === 'format') {
                        return next({ status: 400, code: 19, message: error });
                    }

                    if (error.dataPath === '.gender' && error.keyword === 'enum') {
                        return next({ status: 400, code: 21, message: error });
                    }

                    if (error.dataPath === '.name' && error.keyword === 'type') {
                        return next({ status: 400, code: 22, message: error });
                    }

                    if (error.dataPath === '.dateOfBirth' && error.keyword === 'type') {
                        return next({ status: 400, code: 23, message: error });
                    }
                }

                return next();
            },

            settings: (req, res, next) => {

                let schema = require('./schemas/user/settings.json'),
                    validate = ajv.compile(schema),
                    valid = validate(req.body);

                if (!valid) {
                    let error = validate.errors[0];
                    return next({ status: 400, code: 12, message: error });
                }

                return next();
            }
        },

        image: {

            create: (req, res, next) => {

                let schema = require('./schemas/image/create.json'),
                    validate = ajv.compile(schema),
                    valid = validate(req.body);

                // TODO - Check errors
                if (!valid) {
                    let error = validate.errors[0];
                    return next({ status: 400, code: 19, message: error });
                }

                return next();
            }
        }
    };

module.exports = validators;
