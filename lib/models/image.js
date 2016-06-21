/*jshint esversion: 6 */
const Factory = require('../utils/factory.js');
const Executor = require('../utils/executor.js');
module.exports = class Image {
  //we should not need this
  constructor(file) {
    this.image = new Factory('images', file);
  }

  save(callback) {
    this.image.set("status", "saved"); //TODO: scommentare questo
    this.image.save(callback);

    this.build(); //privato _?
  }

  build() {
    var executor = new Executor(this.image.getData());
    executor.build();
  }
  update(callback){
    let {uid, status} = this.image.getData();
    // if(status==="building"){
      //TODO: at this point type should be docker and not docker-template
      // this.build();
    // }
    this.image.update(uid,callback);
  }
  static getAll() {

    return Factory.getAll('images');

  }
};
