'use strict';


var Factory = require('rosie').Factory,
    faker = require('faker/locale/en'),
    random = function random(prepend, number) {
        let result = [];
        faker.lorem.words(number).map(function (tag) {
            result.push(prepend + tag);
        });

        return result;
    };

module.exports = new Factory()
    .attr('tags', function () {
        let amount = Math.floor(Math.random() * 10) + 1;
        return random('#', amount);
    })
    .attr('mentions', function () {
        let amount = Math.floor(Math.random() * 10) + 1;
        return random('@', amount);
    })
    .attr('comment', function () {
        return faker.lorem.sentence();
    });
