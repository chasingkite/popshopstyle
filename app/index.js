'use strict';


let express = require('express'),
    config = require('./config'),
    api = express(),
    app = express(),
    versionPath = config.api.version || '/v1',
    apiPort = process.env.PORT;

// Setting up the actual API.
api.locals.versionPath = versionPath;
api.use(
    function setHeaders(req, res, next) {
        res.setHeader('X-Powered-By', 'analogbird.com');
        return next();
    },
    require('compression')(),
    require('body-parser').json(),
    require('body-parser').urlencoded({ extended: false }),
    require('serve-favicon')(__dirname + '/public/favicon.png'),
    require('./library/router')(express),
    require('./library/error')
);

// Mounting the API to the current version path.
app.use(versionPath, api);
app.route('/').get((req, res) => {
    res.redirect(301, versionPath);
    res.end();
});

app.listen(apiPort, () => {
    console.log(`Up on port: ${apiPort}`);
});