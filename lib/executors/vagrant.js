/*jshint esversion: 6 */
const fs = require('fs');
const vagrant = require('node-vagrant');

var obj = {
    "config": {
        "vm": {
            "box": "ubuntu/trusty64"
        },
        "network": {
            "type": "public_network",
            "detail": {
                "guest": 83,
                "host": 85
            }
        },
        "provisioners": [{
            "type": "docker",
            "name": "docker1",
            "config": {
                "commands": [
                    "build_image '/vagrant', args: '-t my-name/my-new-image'"
                ]
            }
        }]
    }
};



module.exports = class Vagrant {
    constructor(image) {
        // vagrant.globalStatus("--prune", function(err, out) {
        //     console.log(err, out);
        //
        // });
        //
        // vagrant.version(function(err, out) {
        //     console.log(err, out);
        // });
        this.image = image;
    }
    build() {
        console.log("build");
        var machine = vagrant.create({
            cwd: 'C:/tests',
            env: process.env
        });

        function onInit(err, out) {
            if (err) throw new Error(err);

            machine.on('progress', function() {
                console.log('download progress: ', [].slice.call(arguments));
            });

            machine.on('up-progress', function() {
                console.log('up progress: ', [].slice.call(arguments));
            });
            //up and shutdown to complete the provisioning
            machine.up(function(err, out) {
                if (err) throw new Error(err);

                machine.status(function(err, out) {
                    console.log('status');
                    console.log(err, out);


                        machine.halt(function(err, out) {
                            console.log('halt33');
                            console.log(err, out);

                        });

                });
            });
        }
        machine.init('ubuntu/trusty64', obj, onInit);
    }
    run() {
        console.log('vagrant run');
    }
};
