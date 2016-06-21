'use strict';


let fs = require('fs'),
    mongoose = require('mongoose'),
    config = require('../../config/index'),
    loadedModels = null;

module.exports = (function models$loadModels() {

    var schemaPath = __dirname + '/schemas/',
        mongo = config.mongo;

    if (!loadedModels) {

        mongoose.connect(mongo.url, mongo.options);
        mongoose.connection.on('error', console.error.bind(console, 'DB connection error:'));
        mongoose.Promise = global.Promise;

        loadedModels = {};

        fs.readdirSync(schemaPath).forEach(function (file) {
            if (file.match(/(.+)\.js(on)?$/)) {
                fs.stat(schemaPath + file, function (err) {
                    if (!err) {

                        /**
                         * Get the model name by removing the file extension.
                         */
                        loadedModels[file.replace('.js', '')] = require(schemaPath + file)(mongoose);
                    } else {
                        console.error('I was not able to find the', file, 'model.');
                    }
                });
            }
        });
    }

    loadedModels.objectId = mongoose.Types.ObjectId;

    return loadedModels;
}());
