'use strict';


let aws = require('aws-sdk'),
    config = require('../../../config'),
    crypto = require('../../../library/crypto'),
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

    uploadSignature: (user) => {

        return new Promise ((yes, no) => {

            aws.config = config.aws;
            let S3 = new aws.S3(), //{ endpoint: config.urls.upload, s3BucketEndpoint: true }
                fileName = uuid.v4() + '.jpg',
                params = {
                    Bucket: config.aws.bucket,
                    Key: user.username + '/' + fileName,
                    ContentType: 'image/jpeg',
                    Expires: config.aws.uploadExpiration
                };

            S3.getSignedUrl('putObject', params, function (error, url) {
                if (error) {
                    return no({ status: 500, code: 10, message: error });
                }

                yes({
                    token: crypto.hmac(fileName, 'md5'),
                    fileName: fileName,
                    uploadUrl: url
                });
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
         * @see pre.save() in model.image.
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
