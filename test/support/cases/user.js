'use strict';

global.test.createdUsers = [];
let tools = require('../tools'),
    user = require('../factories/user'),
    validate = require('../validators'),
    createUsers = function (quantity, done, inputUser, expectedStatusCode) {

        let userIndex = 0,
            createUser = function () {
                let fakeUser = user.build();
                if (!global.test.duplicateUser) {
                    global.test.duplicateUser = fakeUser;
                }

                let request = tools.request({
                    method: 'POST',
                    path: '/v1/users',
                    body: inputUser || fakeUser,
                    expectedStatusCode: expectedStatusCode || 200
                });

                request.then(function (user) {
                    user.username = fakeUser.username;
                    global.test.createdUsers.push(user);

                    userIndex += 1;
                    if (userIndex < quantity) {
                        return createUser();
                    }

                    done();
                }).catch(function (error) {
                    done(error);
                });
            };

        createUser();
    };

module.exports = function () {

    describe('Status: 200', function () {

        it('Create (two)', function (done) {
            createUsers(2, done);
        });

        it('Activate', function (done) {

            let query = { username: global.test.createdUsers[0].username.toLowerCase() };
            tools.db.readRecord(query, 'users').then(function (data) {

                global.test.activatedUser = data[0].meta.pin;
                return tools.request({
                    method: 'POST',
                    path: '/v1/users/activate/' + data[0].meta.pin
                });
            }).then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Read (/users/me)', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/users/me',
                session: global.test.createdUsers[0]
            });

            request.then(function (user) {
                validate.user(user);
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Update', function (done) {

            let request = tools.request({
                method: 'PUT',
                path: '/v1/users',
                session: global.test.createdUsers[0],
                body: {
                    about: 'I am the architect, as easy as that.',
                    website: null,
                    dateOfBirth: null,
                    name: {
                        first: null,
                        last: 'Aichholzer'
                    }
                }
            });

            request.then(function (user) {
                validate.user(user);
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Read (/users/{username})', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/users/' + global.test.createdUsers[1].username,
                session: global.test.createdUsers[0]
            });

            request.then(function (user) {
                validate.user(user);
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Read settings', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/users/me/settings',
                session: global.test.createdUsers[0]
            });

            request.then(function (settings) {
                global.test.userSettings = settings;
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Update settings', function (done) {

            global.test.userSettings.notifications.email = true;
            global.test.userSettings.notifications.push = true;
            let request = tools.request({
                method: 'PUT',
                path: '/v1/users/me/settings',
                body: global.test.userSettings,
                session: global.test.createdUsers[0]
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Follow (A follows B)', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/users/' + global.test.createdUsers[1].username + '/follow',
                session: global.test.createdUsers[0]
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Follow (B follows A)', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/users/' + global.test.createdUsers[0].username + '/follow',
                session: global.test.createdUsers[1]
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Read followers', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/users/me/followers',
                session: global.test.createdUsers[1]
            });

            request.then(function (followers) {
                validate.follows(followers);
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Read followees', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/users/me/followees',
                session: global.test.createdUsers[0]
            });

            request.then(function (followees) {
                validate.follows(followees);
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Unfollow (A unfollows B)', function (done) {

            let request = tools.request({
                method: 'DELETE',
                path: '/v1/users/' + global.test.createdUsers[1].username + '/follow',
                session: global.test.createdUsers[0]
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Search (find one)', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/users/search/?query=' + global.test.createdUsers[0].username,
                session: global.test.createdUsers[0]
            });

            request.then(function (users) {
                validate.users(users, { expectedLength: 1 });
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Search (find none)', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/users/search/?query=evenflow',
                session: global.test.createdUsers[0]
            });

            request.then(function (users) {
                validate.users(users, { expectedLength: 0 });
                done();
            }).catch(function (error) {
                done(error);
            });
        });

    });

    describe('Status: !200', function () {

        it('Duplicate email', function (done) {

            let wrongUser = JSON.parse(JSON.stringify(global.test.duplicateUser));
            wrongUser.username = Math.random();

            createUsers(1, done, wrongUser, 400);
        });

        it('Activate an activated user', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/users/activate/' + global.test.activatedUser,
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Activate an non-existing user', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/users/activate/invalid.activation.token',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Duplicate username', function (done) {

            let wrongUser = JSON.parse(JSON.stringify(global.test.duplicateUser));
            wrongUser.email = Math.random() + '@ibrag.it';

            createUsers(1, done, wrongUser, 400);
        });

        it('Wrong email format', function (done) {

            let wrongUser = JSON.parse(JSON.stringify(global.test.duplicateUser));
            wrongUser.email = 'wrong.email.format';

            createUsers(1, done, wrongUser, 400);
        });

        it('Wrong username format', function (done) {

            let wrongUser = JSON.parse(JSON.stringify(global.test.duplicateUser));
            wrongUser.username = 'bad';

            createUsers(1, done, wrongUser, 400);
        });

        it('Wrong password format', function (done) {

            let wrongUser = JSON.parse(JSON.stringify(global.test.duplicateUser));
            wrongUser.password = '';

            createUsers(1, done, wrongUser, 400);
        });

        it('Wrong uri format', function (done) {

            let wrongUser = JSON.parse(JSON.stringify(global.test.duplicateUser));
            wrongUser.username = Math.random() + '';
            wrongUser.email = Math.random() + '@ibrag.it';
            wrongUser.avatar = 'not a valid avatar';

            createUsers(1, done, wrongUser, 400);
        });

        it('Read a non-existing user', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/users/you',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Read another user\'s settings', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/users/' + global.test.createdUsers[1].username + '/settings',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Update another user\'s settings', function (done) {

            let request = tools.request({
                method: 'PUT',
                path: '/v1/users/' + global.test.createdUsers[1].username + '/settings',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Follow yourself', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/users/' + global.test.createdUsers[1].username + '/follow',
                session: global.test.createdUsers[1],
                expectedStatusCode: 400
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Follow the same user twice', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/users/' + global.test.createdUsers[0].username + '/follow',
                session: global.test.createdUsers[1],
                expectedStatusCode: 400
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Follow a non-existing user', function (done) {

            let request = tools.request({
                method: 'POST',
                path: '/v1/users/not.a.existing.user/follow',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Unfollow a non-existing user', function (done) {

            let request = tools.request({
                method: 'DELETE',
                path: '/v1/users/not.a.existing.user/follow',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Read a non-existing user\'s followers', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/users/not.a.existing.user/followers',
                session: global.test.createdUsers[0],
                expectedStatusCode: 404
            });

            request.then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Read a non-existing user\'s followees', function (done) {

            let request = tools.request({
                method: 'GET',
                path: '/v1/users/not.a.existing.user/followees',
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
