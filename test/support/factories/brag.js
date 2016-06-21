'use strict';


var Factory = require('rosie').Factory,
    faker = require('faker/locale/en');

module.exports = new Factory()
    .attr('description', function () {
        return faker.lorem.sentence();
    })
    .attr('location', function () {
        return {
            lon: faker.address.longitude(),
            lat: faker.address.latitude()
        };
    })
    .attr('autoPost', function () {
        return {
            google: faker.random.boolean(),
            facebook: faker.random.boolean(),
            twitter: faker.random.boolean()
        };
    });