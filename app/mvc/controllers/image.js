'use strict';


let model = require('../models'),
    id = require('../../library/id'),
    format = require('./helpers/format'),
    imageHelper = require('./helpers/image');

module.exports = {

    signature: (req, res, next) => {

        imageHelper.uploadSignature(req.currentSession).then(image => {
            res.send(image);
        }).catch(next);
    },

    create: (req, res, next) => {

        req.body.owner = req.currentSession.userId;
        model.image.create(req.body).then(image => {
            res.send({
                imageId: id.encode(image._id),
                url: `http://media.popshop.style/${req.currentSession.username}/${req.body.fileName}`
            });
        }).catch(next);
    },

    read: (req, res, next) => {

        let image = model.image.findOne({ _id: id.decode(req.params.imageId) })
            .select('-tags -mentions')
            .populate([
                {
                    path: 'author',
                    select: 'username about avatar tally'
                }
            ])
            .lean()
            .exec();

        image.then(image => {
            if (!image) {
                throw new Error({ code: 12 });
            }

            return imageHelper.getComments(image);
        }).then(image => {
            res.send(format.image(image));
        }).catch(next);
    },

    delete: (req, res, next) => {

        // TODO: Create a kue to delete images from S3 and the CDN
        let image = model.image.findOne({ _id: id.decode(req.params.imageId) }).exec();
        image.then(image => {
            if (!image) {
                throw new Error({ code: 12 });
            }

            return image.remove();
        }).then(() => {
            res.status(200).end();
        }).catch(next);
    }
};
