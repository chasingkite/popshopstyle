'use strict';


var Factory = require('rosie').Factory,
    faker = require('faker/locale/en');

module.exports = new Factory()
    .attr('username', function () {
        return faker.internet.userName();
    })
    .attr('email', function () {
        return faker.internet.userName() + '@ibrag.it';
    })
    .attr('password', function () {
        return faker.internet.password();
    });
