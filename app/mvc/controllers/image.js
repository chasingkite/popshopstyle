'use strict';


let model = require('../models'),
    id = require('../../library/id'),
    format = require('./helpers/format'),
    imageHelper = require('./helpers/image'),
    image = {

        get: (req, modelMethods) => {

            let image = model.image.findOne({ _id: id.decode(req.params.imageId) });
            image = modelMethods ? image : image.lean();

            return image.exec();
        },

        signature: (req, res, next) => {

            imageHelper.uploadSignature(req.currentSession, { expires: 30 }).then(image => {
                image.imageId = id.encode(image.imageId);
                res.send(image);
            }).catch(next);
        },

        update: (req, res, next) => {

            /**
             * Brags are actually created on signature registration.
             * An actual brag update is not possible, hence only 'pending' brags
             * may be operated on via this end-point.
             */
            let image = model.image.findOne({ _id: id.decode(req.body.imageId), 'meta.status': 'image.pending' }).exec();
            image.then(image => {

                image = imageHelper.prepare(image, req.body);
                image.save(error => {
                    if (error) {
                        throw new Error(error);
                    }

                    res.send({ imageId: id.encode(image._id) });
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

module.exports = image;
