'use strict';


let tools = require('../tools'),
    expect = require('chai').expect;

module.exports = function () {

    it('Should return a timestamp', function (done) {

        tools.request({ method: 'GET', path: '/v1/time' }).then(function (response) {
            expect(response).to.be.an('object');
            expect(response.time).to.be.a('number');
            done();
        }).catch(function (error) {
            done(error);
        });
    });
};
