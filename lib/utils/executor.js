/*jshint esversion: 6 */
const Docker = require('../executors/docker.js');
const Vagrant = require('../executors/vagrant.js');
module.exports = class Executor {
    //we should not need this
    constructor(image) {
        switch (image.getData().type) {
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

};
