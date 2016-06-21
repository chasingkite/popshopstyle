'use strict';


let id = require('../../../library/id'),
    imageHelper = require('./image'),
    format = {

        user: user => {

            user.dateOfBirth = user.dateOfBirth && Math.floor(new Date(user.dateOfBirth) / 1000);
            user.meta = user.meta && {
                memberSince: Math.floor(new Date(user.meta.memberSince) / 1000),
                lastLogin: Math.floor(new Date(user.meta.lastLogin) / 1000)
            };

            user._id = undefined;
            user.email = undefined;
            user.password = undefined;
            user.notifications = undefined;
            user.socialAccounts = undefined;

            return user;
        },

        users: users => {

            for (let user = 0; user < users.length; user += 1) {
                users[user] = format.user(users[user]);
            }

            return users;
        },

        image: image => {

            image.imageId = id.encode(image._id);
            image.url = {
                thumb: imageHelper.downloadUrl(image, { w: 150, h: 150 }),
                small: imageHelper.downloadUrl(image, { w: 300, h: 300 }),
                medium: imageHelper.downloadUrl(image, { w: 450, h: 450 }),
                large: imageHelper.downloadUrl(image, { w: 610, h: 610 })
            };
            image.meta = {
                createdOn: Math.floor(new Date(image.meta.createdOn) / 1000)
            };

            image._id = undefined;

            return image;
        },

        images: images => {

            for (let image = 0; image < images.length; image += 1) {
                let imageItem = images[image].image ? images[image].toObject().image : images[image];
                images[image] = format.image(imageItem);
            }

            return images;
        }
    };

module.exports = format;
