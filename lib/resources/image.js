/*jshint esversion: 6 */
var model = require('../models/image.js');
var notificationCenter = require('../utils/notificationCenter');

/*
 app.get('/v1/templates', function(req, res) {
     res.send(model.getAll());
 });
 */
module.exports = function(app) {

    app.get('/v1/images', function(req, res) {

    });

    //saves and build new image
    app.post('/v1/images/new', function(req, res) {

    });


    app.delete('/v1/images/:uid', function(req, res) {

    });


    app.put('/v1/images/:uid', function(req, res) {
      console.log('edit image');
    });
};
