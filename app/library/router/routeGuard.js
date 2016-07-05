'use strict';


let validateSignature = require('../validate/signature'),
    routeGuard = {

        unlockedRoutes: {},

        /**
         * Check for unlocked, signature-free, routes.
         *
         * @param {string} method - The HTTP method
         * @param {string} pathToCheck - The requested URI
         * @returns {boolean} - Whether the route is unlocked or not
         */
        isUnlocked: function routeLock$isUnlocked(method, pathToCheck) {

            method = method.toLowerCase();
            if (!this.unlockedRoutes.hasOwnProperty(method)) {
                return false;
            }

            return this.unlockedRoutes[method].some(insecurePath => {
                if (insecurePath instanceof RegExp) {
                    return insecurePath.test(pathToCheck);
                }

                /**
                 * Support unlocked routes with request parameters.
                 * @see unlockRoutes() ... path = path.replace(/:\w+/g, '[\\w-]+');
                 */
                if (insecurePath.indexOf('[\\w-]+') > 0) {
                    let requestParamsRegEx = new RegExp(insecurePath + '/?$');
                    return requestParamsRegEx.test(pathToCheck);
                }

                return pathToCheck === insecurePath;
            });
        },

        stripTrailingSlashes: string => {
            return typeof string === 'string' ? string.replace(/\b\/+$/, '') : string;
        }
    };

module.exports = {

    check: (req, res, next) => {
        return routeGuard.isUnlocked(req.method, req.path) ? next() : validateSignature(req, res, next);
    },

    /**
     * By default, all routes require signature validation, this is not always a requirement and that
     * validation can be disabled with this commodity method.
     * The exported method is passed into each route and it may be used as needed.
     *
     * @param {array} routes - An array of (object) routes to be unlocked.
     */
    unlockRoutes: routes => {

        routes.forEach(route => {
            let method = Object.keys(route)[0];

            if (!routeGuard.unlockedRoutes.hasOwnProperty(method)) {
                routeGuard.unlockedRoutes[method] = [];
            }

            let path = routeGuard.stripTrailingSlashes(route[method]).replace(/:\w+/g, '[\\w-]+');
            routeGuard.unlockedRoutes[method].push(path);
        });
    }
};