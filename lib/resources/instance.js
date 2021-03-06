/*jshint esversion: 6 */
const qp = require('../utils/query-parameters');
const Instance = require('../models/Instance.js');

// const Instance = require('../models/instance.js');


module.exports = function (app) {

  app.get('/v1/instances', function (req, res) {
    Instance.getAll((data)=> {
      res.json(data);
    });
  });


  app.post('/v1/instances/new', function (req, res) {
    let uidObj = qp(req);
    let instance = new Instance();
    instance.newInstanceFromImage(uidObj, req.body);
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

  app.delete('/v1/instances/:uid', function (req, res) {
    let callback = (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }
    };
    let found = Instance.findByUid({uid: req.params.uid});
    let instance = new Instance();
    instance.newInstance(found.obj);
    instance.delete(callback);
  });


  app.put('/v1/instances/:uid', function (req, res) {
    console.log('uid:'+req.params.uid);
    console.log('body:',req.body);
    let callback = (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }
    };
    let found = Instance.findByUid({uid: req.params.uid});
    let instance = new Instance();
    instance.newInstance(found.obj);
    if(req.body.action==='pause'){
      instance.pause(callback);
    }else if(req.body.action==='start'){
      instance.start(callback);
    }else if(req.body.action==='up'){
      instance.up(callback);
    }else if(req.body.action==='poweroff'){
      instance.poweroff(callback);
    }
  });

};
