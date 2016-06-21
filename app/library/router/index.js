'use strict';


let fs = require('fs'),
    routeGuard = require('./routeGuard'),
    validate = require('../validate'),
    appRouter = {

        /**
         * This will setup the routes (as found in the routes folder). It will also try to
         * load a corresponding controller and pass it into the route.
         * If a corresponding controller is not found, for any given route, then that route will not be available.
         *
         * @see auth.unlockRoutes()
         * @returns {Router}
         */
        setup: router => {

            let schemaPath = __dirname + '/routes/',
                control = __dirname + '/../../mvc/controllers/';

            router.use(routeGuard.check);
            router.use(validate.sanitizeBody);
            router.unlockRoutes = routeGuard.unlockRoutes;

            fs.readdirSync(schemaPath).forEach(file => {
                if (file.match(/(.+)\.js(on)?$/)) {
                    fs.stat(control + file, error => {
                        if (!error) {
                            router = require(schemaPath + file)(router, require(control + file));
                        } else {
                            console.error(`I was not able to find a controller for the ${file} route.`);
                        }
                    });
                }
            });

            return router;
        }
    };

module.exports = express => {
    return appRouter.setup(express.Router());
};