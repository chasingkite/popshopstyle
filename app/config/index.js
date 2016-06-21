'use strict';


let env = {

    requiredVariables: [
        'NODE_ENV',
        'API_KEY',
        'COMETA_KEY',
        'URL_CDN',
        'URL_APP',
        'MONGO_URL',
        'REDIS_URL',
        'MANDRILL_KEY'
    ],

    /**
     * Get value of specified environment variable. If it is not set return defaultValue.
     * Throw an error if it's required bur not set.
     *
     * By default, all .env variables are handled as strings, hence the switch() at the bottom to
     * prevent possible issues due to inconsistent types.
     *
     * @param {string} variableName - The variable being requested
     * @param {string} defaultValue - The default value to be used in case the variable has not been set
     * @param {type} castAs - As what the given variable should be casted
     * @returns {string|number}
     */
    get: function (variableName, defaultValue, castAs) {

        if (this.requiredVariables.indexOf(variableName) >= 0 && process.env[variableName] === undefined) {
            throw new Error(`All the required environment variables must be set. Missing: ${variableName}`);
        }

        let envVariable = process.env[variableName] === undefined ? defaultValue : process.env[variableName];

        if (envVariable === undefined) {
            return undefined;
        }

        switch (castAs) {
            case Boolean: envVariable = envVariable === 'true' || false;
                break;

            case Number: envVariable = parseInt(envVariable, 10);
                break;

            default:
            case String: envVariable = envVariable.toString();
                break;
        }

        return envVariable;
    }
};

module.exports = {
    env: env.get('NODE_ENV'),
    api: {
        version: env.get('API_VERSION', '/v1'),
        hits: {
            perDay: env.get('HITS_PER_DAY', 21600, Number),
            timeOut: env.get('HITS_TIMEOUT', 10, Number)
        },
        stopEmailNotifications: env.get('STOP_EMAIL_NOTIFICATIONS', false, Boolean)
    },
    keys: {
        api: env.get('API_KEY'),
        cometa: env.get('COMETA_KEY')
    },
    urls: {
        cdn: env.get('URL_CDN'),
        app: env.get('URL_APP')
    },
    aws: {
        accessKeyId: env.get('AWS_ACCESS_KEY'),
        secretAccessKey: env.get('AWS_ACCESS_SECRET'),
        region: env.get('AWS_REGION'),
        bucket: env.get('AWS_BUCKET')
    },
    mongo: {
        url: env.get('MONGO_URL'),
        options: {
            db: {
                native_parser: true
            },
            server: {
                poolSize: env.get('MONGO_POOL_SIZE', 10, Number),
                socketOptions: {
                    keepAlive: env.get('MONGO_KEEP_ALIVE', 1, Number)
                }
            }
        }
    },
    mandrill: {
        key: env.get('MANDRILL_KEY')
    },
    redis: {
        url: env.get('REDIS_URL'),
        keyPrefix: env.get('REDIS_PREFIX', 'PHLOW'),
        keyExpiration: env.get('REDIS_KEY_EXPIRATION', 7200, Number)
    },
    worker: {
        stopDownloadLog: env.get('STOP_WORKER_DOWNLOAD_LOG', false, Boolean),
        stopStreamLog: env.get('STOP_WORKER_STREAM_LOG', false, Boolean)
    }
};
