'use strict';


module.exports = {

    home: (req, res) => {
        res.send({
            version: "/v1",
            api: "PopShop",
            message: "You are lost. Try using an actual endpoint."
        });
    },

    time: (req, res) => {
        res.send({
            time: Math.floor(new Date() / 1000)
        });
    }
};