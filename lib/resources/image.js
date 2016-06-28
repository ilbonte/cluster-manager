/*jshint esversion: 6 */
const Image = require('../models/image.js');


module.exports = function (app) {

  app.get('/v1/images', function (req, res) {
    //1.update il file in base all'analisi che ho fatto
    //TODO: implementare questo
    //2. rimanda il file

    Image.getAll((data)=>{res.json(data);});
    // res.send(Image.getAllFromFactory().getData());
  });

  app.post('/v1/images/new', function (req, res) {
    console.log('new image incoming');
    let image = new Image(req.body);
//     image.save((err, result) => {
// //not sure if this works
//       if (err) {
//         res.send(err);
//       } else {
//         //should send the inserted image
//         res.json(result);
//       }
//     });
  });


  app.delete('/v1/images/:uid', function (req, res) {
    console.log("delete");
    let callback = (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }
    };
    if(req.body.name){
      Image.directDelete(req.body.name,callback);
    }else{
      let found= Image.findByUid({uid:req.params.uid});
      console.log(found.obj);
      let image = new Image(found.obj);
      console.log(req.params.uid);
      image.delete(callback);

    }
  });


  app.put('/v1/images/:uid', function (req, res) {
    console.log('editing');
    // let image = new Image(req.body);
    // image.update((err,result)=>{
    //   if (err) {
    //     res.send(err);
    //   } else {
    //     //should send the inserted image
    //     res.json(result);
    //   }
    // });

    let found= Image.findByUid({uid:req.params.uid});
    console.log(found.obj);
    let image = new Image(found.obj);
    image.delete((err, result) => {
      if (err) {
        res.send(err);
      } else {
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
      }
    });

  });
};
