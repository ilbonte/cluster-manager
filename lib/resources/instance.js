/*jshint esversion: 6 */
const qp = require('../utils/query-parameters');

// const Instance = require('../models/instance.js');


module.exports = function(app) {

    app.get('/v1/instances', function(req, res) {

    });


    app.post('/v1/instances/new', function(req, res) {
        console.log('new instance');
         var imageId = qp(req);
         console.log(imageId);
         console.log(req.body);
    });

    app.delete('/v1/instances/:uid', function(req, res) {

    });


    app.put('/v1/instances/:uid', function(req, res) {

    });

};
