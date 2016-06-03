/*jshint esversion: 6 */
const Docker = require('../executors/docker.js');
const Vagrant = require('../executors/vagrant.js');
module.exports = class Executor {
    //we should not need this
    constructor(image) {
        switch (image.type) {
            case 'docker':
                this.platform = new Docker(image);
                break;
            case 'vagrant':
                this.platform = new Vagrant(image);
                break;
            default:
                console.log('Error: image not supported yet');
        }
    }

    build(){
      this.platform.build();
    }

};
