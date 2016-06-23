/*jshint esversion: 6 */
const Image = require('../models/image.js');
// var notificationCenter = require('../utils/notificationCenter');


module.exports = function (app) {

  app.get('/v1/images', function (req, res) {
    //1.update il file in base all'analisi che ho fatto
    //TODO: implementare questo
    //2. rimanda il file

    res.send(Image.getAllFromFactory().getData());
  });

  //saves and build new image
  /*docker-template*/
// {
//     "type": "docker-template",
//     "name": "example template",
//     "config": {
//         "build": [{
//             "from": "ubuntu"
//         }, {
//             "entrypoint": "ls"
//         }, {
//             "add": "www www"
//         }, {
//             "run": "apt-get update"
//         }, {
//             "run": "ls"
//         }],
//         "run": {
//             "adress": "0.0.0.0",
//             "hostport": "2222",
//             "guestport": "22"
//         }
//     }
//
// }
  app.post('/v1/images/new', function (req, res) {
    var image = new Image(req.body);
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


  app.delete('/v1/images/:uid', function (req, res) {

  });


  app.put('/v1/images/:uid', function (req, res) {
    var image = new Image(req.body);
    image.update((err,result)=>{
      if (err) {
        res.send(err);
      } else {
        //should send the inserted image
        res.json(result);
      }
    });
  });
};
