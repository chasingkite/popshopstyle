'use strict';


let fs = require('fs'),
    id = require('../../library/id'),
    routeGuard = require('./routeGuard'),
    validate = require('../validate'),
    paging = function paging(req, res, next) {

        req.items = Math.abs(req.query.items);
        req.items = req.items <= 50 ? parseInt(req.items, 10) : 10;
        req.sort = { '_id': 'desc' };

        req.span = null;
        let before = req.query.before && id.decode(req.query.before) || null,
            after = req.query.after && id.decode(req.query.after) || null;

        if (before) {
            req.span = { $lt: before };
        } else if (after) {
            req.span = { $gt: after };
            req.sort = { '_id': 'asc' };
        }

        return next();
    },
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

            router.route('*').get(paging);
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