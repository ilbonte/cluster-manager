/*jshint esversion: 6 */
const Factory = require('../utils/factory');

// var image = new Factory('image', {location:"pelizzano", name:"trampolini"});
// image.save(function(err,res){
//     if(err){
//       console.log(err);
//     }else{
//       console.log('salvo');
//       console.log(res);
//     }
// });



var image2= Factory.findByUid('image',{uid:"54j2zlilvvzgg392jg7o"}, wrappa);
image2.set('location', 'new ossana');


image2.update(image2.getData().uid, function(err,res){
  console.log(res);
});

function wrappa(obj) {
  console.log('va che me tocca fa');
  return new Factory('image', obj);
}



// console.log(Factory.getAll('image'));
