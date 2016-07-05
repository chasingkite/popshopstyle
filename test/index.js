'use strict';


global.test = {};
let tools = require('./support/tools'),
    general = require('./support/cases/general'),
    user = require('./support/cases/user'),
    brag = require('./support/cases/brag');

describe('API', function () {

    before(function (done) {

        tools.db.setup().then(function (next) {
            return next();
        }).then(function (next) {
            return next();
        }).then(function () {
            done();
        }).catch(function (error) {
            done(error);
        });
    });

    beforeEach(function () {
        tools.request({ method: 'GET', path: '/v1/time' }).then(function (response) {
            global.test.time = response.time;
        }).catch(function (error) {
            console.error(error);
        });
    });

    // General
    describe('General features', general);

    // User
    describe('User', user);

    // Brag
    describe('Brag', brag);
});
