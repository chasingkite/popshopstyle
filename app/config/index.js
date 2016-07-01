'use strict';


module.exports = {
    env: process.env.NODE_ENV,
    hashLength: parseInt(process.env.HASH_ID_LENGTH) || 12,
    api: {
        version: process.env.API_VERSION || '/v1',
        hits: {
            perDay: parseInt(process.env.HITS_PER_DAY) || 21600,
            timeOut: parseInt(process.env.HITS_TIMEOUT) || 10
        },
        stopEmailNotifications: process.env.STOP_EMAIL_NOTIFICATIONS || false
    },
    keys: {
        api: process.env.API_KEY,
        cometa: process.env.COMETA_KEY
    },
    urls: {
        api: process.env.URL_API,
        cdn: process.env.URL_CDN,
        app: process.env.URL_APP,
        upload: process.env.URL_UPLOAD
    },
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_ACCESS_SECRET,
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_BUCKET,
        signatureVersion: process.env.AWS_SIGNATURE_VERSION,
        uploadExpiration: parseInt(process.env.AWS_UPLOAD_EXPIRATION) || 30
    },
    mongo: {
        url: process.env.MONGO_URL,
        options: {
            db: {
                native_parser: true
            },
            server: {
                poolSize: parseInt(process.env.MONGO_POOL_SIZE) || 10,
                socketOptions: {
                    keepAlive: parseInt(process.env.MONGO_KEEP_ALIVE) || 1
                }
            }
        }
    },
    mandrill: {
        key: process.env.MANDRILL_KEY
    },
    redis: {
        url: process.env.REDIS_URL,
        keyPrefix: process.env.REDIS_PREFIX || 'AB',
        keyExpiration: parseInt(process.env.REDIS_KEY_EXPIRATION) || 7200
    }
};