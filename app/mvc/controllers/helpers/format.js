'use strict';


let id = require('../../../library/id'),
    imageHelper = require('./image'),
    query = require('querystring'),
    format = {

        user: (user, currentSession) => {

            user.userId = id.encode(user._id);
            user.dateOfBirth = user.dateOfBirth && Math.floor(new Date(user.dateOfBirth) / 1000);
            user.meta = user.meta && {
                memberSince: Math.floor(new Date(user.meta.memberSince) / 1000),
                lastLogin: Math.floor(new Date(user.meta.lastLogin) / 1000)
            };

            if (currentSession && (user._id.toString() !== currentSession.userId)) {
                user.email = undefined;
            }

            user._id = undefined;
            user.notifications = undefined;
            user.socialAccounts = undefined;

            return user;
        },

        users: (users, currentSession) => {

            for (let user = 0; user < users.length; user += 1) {
                users[user] = format.user(users[user], currentSession);
            }

            return users;
        },

        image: image => {

            image.imageId = id.encode(image._id);
            image.urls = imageHelper.downloadUrl(image);
            /*{
                thumb: imageHelper.downloadUrl(image, { w: 200, h: 200 }),
                small: imageHelper.downloadUrl(image, { w: 480, h: 480 }),
                medium: imageHelper.downloadUrl(image, { w: 640, h: 640 }),
                large: imageHelper.downloadUrl(image, { w: 1080, h: 1080 })
            };
            */

            image._id = undefined;
            image.owner = undefined;

            return image;
        },

        images: images => {

            for (let image = 0; image < images.length; image += 1) {
                let imageItem = images[image].image ? images[image].toObject().image : images[image];
                images[image] = format.image(imageItem);
            }

            return images;
        },

        paging: (span, req, data, property) => {

            delete req.query.before;
            delete req.query.after;

            let myQuery = Object.assign({}, req.query);
            if (data.length) {
                myQuery[span] = span === 'before' ? data[0][property] : data[data.length - 1][property];
            }

            return req.baseUrl + req.path + '?' + query.stringify(myQuery);
        }
    };

module.exports = format;
