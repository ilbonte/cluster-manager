/*jshint esversion: 6 */
const Factory = require('../utils/factory.js');
const Executor = require('../utils/executor.js');
module.exports = class Image {
  //we should not need this
  constructor(file) {
    this.image= new Factory('images', file);
  }
  save (callback) {
    //this.image.set(status,"building") //TODO: scommentare questo
    this.image.save(callback);

    this.build(); //privato _?
  }
  build(){
    var executor = new Executor(this.image.getData());
    executor.build();
  }
  static getAll(){

    return Factory.getAll('images');

  }
};
