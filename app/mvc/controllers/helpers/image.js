'use strict';


let aws = require('aws-sdk'),
    config = require('../../../config'),
    crypto = require('../../../library/crypto'),
    model = require('../../models'),
    uuid = require('node-uuid'),
    querystring = require('querystring'),
    processCoordinates = coordinates => {

        if (!coordinates) {
            return undefined;
        }

        let lon = parseFloat(coordinates.lon) || false,
            lat = parseFloat(coordinates.lat) || false;

        if (lon && lat) {
            return [lon, lat];
        }

        return undefined;
    };

module.exports = {

    uploadSignature: (user, options) => {

        return new Promise ((yes, no) => {

            aws.config = config.aws;
            let S3 = new aws.S3(),
                fileName = uuid.v4() + '.jpg',
                params = {
                    Bucket: config.aws.bucket,
                    Key: user.username + '/' + fileName,
                    ContentType: 'image/jpeg',
                    Expires: options && options.expire ? options.expire : 30
                };

            S3.getSignedUrl('putObject', params, (error, url) => {
                if (error) {
                    return no({ status: 500, code: 10, message: error });
                }

                let image = {
                    author: user.userId,
                    fileName: fileName,
                    'meta.status': 'image.pending'
                };
                model.image.create(image).then(image => {
                    yes({ imageId: image._id, uploadUrl: url });
                }).catch(no);
            });
        });
    },

    downloadUrl: (image, size) => {

        let domain = config.urls.cdn,
            url = '/' + image.author.username + '/' + image.fileName + '?' + querystring.stringify(size),
            signature = crypto.hmac(domain.replace(/https?:\/\//i, '') + url, 'sha1', 'hex', config.keys.cometa);

        return domain + '/' + signature + url;
    },

    prepare: (image, body) => {

        image.description = body.description || null;
        image.meta.status = 'active';

        /**
         * @see pre.save() in model.brag.
         */
        let coordinates = processCoordinates(body.location);
        if (coordinates) {
            image.location = {
                type: 'Point',
                coordinates: coordinates
            };
        } else {
            image.location = undefined;
        }

        return image;
    }
};
