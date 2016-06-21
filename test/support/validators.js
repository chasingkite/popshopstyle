'use strict';


var expect = require('chai').expect,
    validators = {
        user: function validators$user(user, options) {

            options = options || { skip: [] };

            expect(user).to.be.an('object');
            expect(user.username).to.be.a('string');
            expect(user.about).to.be.a('string');
            expect(user.avatar).to.be.a('string');

            expect(user.tally).to.be.an('object');
            expect(user.tally.followees).to.be.a('number');
            expect(user.tally.followers).to.be.a('number');
            expect(user.tally.respect).to.be.a('number');
            expect(user.tally.brags).to.be.a('number');

            if (options.skip.indexOf('meta') < 0) {
                expect(user.meta).to.be.an('object');
                expect(user.meta.memberSince).to.be.a('number');
                expect(user.meta.lastLogin).to.be.a('number');
            }

            if (user.website) {
                expect(user.website).to.be.a('string');
            }

            if (user.dateOfBirth) {
                expect(user.dateOfBirth).to.be.a('number');
            }

            if (user.gender) {
                expect(user.gender).to.be.a('string');
            }

            if (user.name) {
                expect(user.name).to.be.an('object');

                if (user.name.first) {
                    expect(user.name.first).to.be.a('string');
                }

                if (user.name.last) {
                    expect(user.name.last).to.be.a('string');
                }
            }
        },

        users: function validators$users(users, options) {

            expect(users).to.be.an('object');

            expect(users.totalRecords).to.be.a('number');
            expect(users.data).to.be.an('array');
            expect(users.data.length).to.be.eql(options.expectedLength);

            users.data.forEach(function (user) {
                validators.user(user, { skip: 'meta' });
            });
        },

        follows: function validators$follows(followers) {

            expect(followers).to.be.an('object');

            expect(followers.totalRecords).to.be.a('number');
            expect(followers.data).to.be.an('array');
            expect(followers.data.length).to.be.eql(1);

            followers.data.forEach(function (user) {
                validators.user(user, { skip: 'meta' });
                expect(user.followSince).to.be.a('number');
            });
        },

        brag: function validators$brag(brag) {

            expect(brag).to.be.an('object');

            expect(brag.bragId).to.be.a('string');
            expect(brag.description).to.be.a('string');

            expect(brag.author).to.be.an('object');
            expect(brag.author.username).to.be.a('string');
            expect(brag.author.tally).to.be.an('object');
            expect(brag.author.tally.followees).to.be.a('number');
            expect(brag.author.tally.followers).to.be.a('number');
            expect(brag.author.tally.respect).to.be.a('number');
            expect(brag.author.tally.brags).to.be.a('number');

            expect(brag.tally).to.be.an('object');
            expect(brag.tally.respect).to.be.a('number');

            expect(brag.meta).to.be.an('object');
            expect(brag.meta.createdOn).to.be.a('number');

            expect(brag.image).to.be.an('object');
            expect(brag.image.thumb).to.be.a('string');
            expect(brag.image.small).to.be.a('string');
            expect(brag.image.medium).to.be.a('string');
            expect(brag.image.large).to.be.a('string');

            if (brag.comments) {
                expect(brag.comments).to.be.an('array');
                expect(brag.comments.length).to.be.eql(10);
                brag.comments.forEach(function (comment) {
                    expect(comment.commentId).to.be.an('string');
                    expect(comment.comment).to.be.an('string');

                    expect(comment.meta).to.be.an('object');
                    expect(comment.meta.createdOn).to.be.a('number');

                    validators.user(comment.author, {skip: 'meta'});
                });
            }

            if (brag.location) {
                expect(brag.location).to.be.an('object');
                expect(brag.location.lon).to.be.a('number');
                expect(brag.location.lat).to.be.a('number');
            }
        },

        brags: function validators$brags(brags) {

            expect(brags).to.be.an('object');

            expect(brags.totalRecords).to.be.a('number');
            expect(brags.data).to.be.an('array');
            expect(brags.data.length).to.be.eql(1);

            brags.data.forEach(function (brag) {
                validators.brag(brag);
            });
        },

        comments: function validators$comments(comments) {

            expect(comments).to.be.an('object');

            expect(comments.totalRecords).to.be.a('number');
            expect(comments.data).to.be.an('array');
            expect(comments.data.length).to.be.eql(20);

            comments.data.forEach(function (comment) {
                validators.user(comment.author, { skip: 'meta' });
                expect(comment.commentId).to.be.a('string');
                expect(comment.meta).to.be.a('object');
                expect(comment.meta.createdOn).to.be.a('number');
            });
        }
    };

module.exports = validators;
