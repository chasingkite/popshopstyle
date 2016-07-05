'use strict';


global.test.createdBrags = [];
let fs = require('fs'),
    tools = require('../tools'),
    brag = require('../factories/brag'),
    property = require('../factories/property'),
    validate = require('../validators'),
    createBrags = function (quantity, done, inputBrag, expectedStatusCode) {

        let bragIndex = 0,
            createBrag = function () {

                let fakeBrag = brag.build(),
                    properties = property.build();

                // Get the upload signature
                tools.request({
                    method: 'GET',
                    path: '/v1/brags/signature',
                    session: global.test.createdUsers[0]
                }).then(function (response) {

                    fakeBrag.bragId = response.bragId;

                    // Upload the image
                    return tools.request({
                        method: 'PUT',
                        uri: response.uploadUrl,
                        body: fs.readFileSync(__dirname + '/../' + process.env.TEST_IMG),
                        external: true
                    });

                }).then(function () {

                    fakeBrag.description += properties.tags.join(' ') + ' ' + properties.mentions.join(' ');
                    if (!global.test.duplicateBrag) {
                        global.test.properties = properties;
                        global.test.duplicateBrag = fakeBrag;
                    } else {
                        delete fakeBrag.location;
                    }

                    // Create the brag
                    return tools.request({
                        method: 'PUT',
                        path: '/v1/brags',
                        body: inputBrag || fakeBrag,
                        session: global.test.createdUsers[0],
                        expectedStatusCode: expectedStatusCode || 200
                    });

                }).then(function (brag) {
                    global.test.createdBrags.push(brag);

                    bragIndex += 1;
                    if (bragIndex < quantity) {
                        return createBrag();
                    }

                    done();
                }).catch(function (error) {
                    done(error);
                });
            };

        createBrag();
    },
    createComments = function (quantity, done, bragId, expectedStatusCode) {

        let commentIndex = 0,
            createComment = function () {
            let properties = property.build(),
                request = tools.request({
                    method: 'POST',
                    path: '/v1/brags/' + bragId + '/comments',
                    body: {
                        comment: properties.comment + ' ' + properties.tags.join(' ') + ' ' + properties.mentions.join(' ')
                    },
                    session: global.test.createdUsers[0],
                    expectedStatusCode: expectedStatusCode || 200
                });

            request.then(function (comment) {
                if (!global.test.createdComment) {
                    global.test.createdComment = comment;
                }

                commentIndex += 1;
                if (commentIndex < quantity) {
                    return createComment();
                }

                done();
            }).catch(function (error) {
                done(error);
            });
        };

        createComment();
    };

module.exports = function () {

    describe('Status: 200', function () {

        it('Create (two)', function (done) {
            createBrags(2, done);
        });

        it('Delete', function (done) {

            let request = tools.request({
                method: 'DELETE',
                path: '/v1/brags/' + global.test.createdBrags[1].bragId,
                session: global.test.createdUsers[0]
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Set respect', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/brags/' + global.test.createdBrags[0].bragId + '/respect',
                session: global.test.createdUsers[0]
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Unset respect', function (done) {

            let request = tools.request({
                method: 'DELETE',
                path: '/v1/brags/' + global.test.createdBrags[0].bragId + '/respect',
                session: global.test.createdUsers[0]
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Create comments (twenty)', function (done) {
            createComments(20, done, global.test.createdBrags[0].bragId);
        });

        it('Read', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/brags/' + global.test.createdBrags[0].bragId,
                session: global.test.createdUsers[0]
            });

            request.then(function (brag) {
                validate.brag(brag);
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Read all comments', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/brags/' + global.test.createdBrags[0].bragId + '/comments',
                session: global.test.createdUsers[0]
            });

            request.then(function (comments) {
                validate.comments(comments);
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Delete a comment', function (done) {

            let request = tools.request({
                method: 'DELETE',
                path: '/v1/brags/' + global.test.createdBrags[0].bragId + '/comments/' + global.test.createdComment.commentId,
                session: global.test.createdUsers[0]
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Add to favorites', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/brags/' + global.test.createdBrags[0].bragId + '/favorites',
                session: global.test.createdUsers[0]
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Read all favorites', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/brags/favorites',
                session: global.test.createdUsers[0]
            });

            request.then(function (brags) {
                validate.brags(brags);
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Remove from favorites', function (done) {

            let request = tools.request({
                method: 'DELETE',
                path: '/v1/brags/' + global.test.createdBrags[0].bragId + '/favorites',
                session: global.test.createdUsers[0]
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Report', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/brags/' + global.test.createdBrags[0].bragId + '/report',
                session: global.test.createdUsers[0]
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Search (by tag)', function (done) {

            let randomIndex = Math.floor(Math.random() * global.test.properties.tags.length),
                randomTag = global.test.properties.tags[randomIndex],
                request = tools.request({
                    method: 'GET',
                    path: '/v1/brags/search?tags=' + encodeURIComponent(randomTag + ', ,'),
                    session: global.test.createdUsers[0]
                });

            request.then(function (brags) {
                validate.brags(brags);
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Search (by location)', function (done) {

            let lon = global.test.duplicateBrag.location.lon,
                lat = global.test.duplicateBrag.location.lat,
                request = tools.request({
                    method: 'GET',
                    path: '/v1/brags/search?lon=' + lon + '&lat=' + lat,
                    session: global.test.createdUsers[0]
                });

            request.then(function (brags) {
                validate.brags(brags);
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Search (by tag and location)', function (done) {

            let randomIndex = Math.floor(Math.random() * global.test.properties.tags.length),
                randomTag = global.test.properties.tags[randomIndex],
                lon = global.test.duplicateBrag.location.lon,
                lat = global.test.duplicateBrag.location.lat,
                request = tools.request({
                    method: 'GET',
                    path: '/v1/brags/search?tags=' + encodeURIComponent(randomTag + ', ,') + '&lon=' + lon + '&lat=' + lat,
                    session: global.test.createdUsers[0]
                });

            request.then(function (brags) {
                validate.brags(brags);
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('All brags (by user)', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/users/' + global.test.createdUsers[0].username + '/brags',
                session: global.test.createdUsers[0]
            });

            request.then(function (brags) {
                validate.brags(brags);
                done();
            }).catch(function (error) {
                done(error);
            });
        });
    });

    describe('Status: !200', function () {

        it('Delete a non-existing brag', function (done) {

            let request = tools.request({
                method: 'DELETE',
                path: '/v1/brags/' + global.test.createdBrags[1].bragId,
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Set respect on non-existing brag', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/brags/' + global.test.createdBrags[1].bragId + '/respect',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Unset respect on non-existing brag', function (done) {

            let request = tools.request({
                method: 'DELETE',
                path: '/v1/brags/' + global.test.createdBrags[1].bragId + '/respect',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Create comment on non-existing brag', function (done) {
            createComments(1, done, global.test.createdBrags[1].bragId, 404);
        });

        it('Read non-existing brag', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/brags/' + global.test.createdBrags[1].bragId,
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Read all comments of non-existing brag', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/brags/' + global.test.createdBrags[1].bragId + '/comments',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function (comments) {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Add to favorites a non-existing brag', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/brags/' + global.test.createdBrags[1].bragId + '/favorites',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Remove from favorites a non-existing brag', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/brags/' + global.test.createdBrags[1].bragId + '/favorites',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Report a non-existing brag', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/brags/' + global.test.createdBrags[1].bragId + '/report',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('All brags (by non-existing user)', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/users/i.am.evenflow/brags',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

    });
};
