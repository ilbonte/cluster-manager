/*jshint esversion: 6 */
const Docker = require('../executors/docker.js');
const Vagrant = require('../executors/vagrant.js');

module.exports = class Executor {
  constructor(image) {
    console.log('triggeraro',image);
    this.title = image.type;

      switch (image.obj.type) {
        case 'docker':
          this.platform = new Docker(image);
          break;
        case 'vagrant':
          this.platform = new Vagrant(image);
          break;
        default:
          console.log('Error: ' + image.getData().type + ' is not supported yet');
      }

  }

  build() {
    this.platform.build();
  }

  run() {
    this.platform.run();
  }
  pause(callback) {
    this.platform.pause(callback);
  }
  start(callback) {
    this.platform.start(callback);
  }
  delete(callback) {
    if (this.title === 'images') {
      this.platform.delete(callback);
    } else if (this.title === 'instances') {
      this.platform.deleteInstance(callback);
    }
  }

};
