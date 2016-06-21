'use strict';


module.exports = (router, control) => {

    router.unlockRoutes([
        { get: '/' },
        { get: '/time' }
    ]);

    router.get('/', control.home);
    router.get('/time', control.time);


    return router;
};
