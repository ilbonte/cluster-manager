/*jshint esversion: 6 */
const qp = require('../utils/query-parameters');
const Image = require('../models/image.js');
const Instance = require('../models/Instance.js');

// const Instance = require('../models/instance.js');


module.exports = function(app) {

    app.get('/v1/instances', function(req, res) {

    });
    /*
    app.post('/v1/images/new', function (req, res) {
      console.log('new image incoming');
      let image = new Image(req.body);
      image.save((err, result) => {
    //not sure if this works
        if (err) {
          res.send(err);
        } else {
          //should send the inserted image
          res.json(result);
        }
      });
    });
    */

    app.post('/v1/instances/new', function(req, res) {
        console.log('new instance');
        let uidObj = qp(req);
        let instance = new Instance(uidObj, req.body);
        instance.saveAndRun((err, result) => {
      //not sure if this works
          if (err) {
            res.send(err);
          } else {
            //should send the inserted image
            res.json(result);
          }
        });

    });

    app.delete('/v1/instances/:uid', function(req, res) {

    });


    app.put('/v1/instances/:uid', function(req, res) {

    });

};
