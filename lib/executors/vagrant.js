/*jshint esversion: 6 */
const fs = require('fs');
const vagrant = require('node-vagrant');
const basePath = 'C:/rewiteRepo/';
const NotificationCenter = require('../utils/notificationCenter');
const notificator = new NotificationCenter();
const each = require("async/each");
const rimraf = require('rimraf');
var ncp = require('ncp').ncp;
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
        this.imageInstance = image;
        this.image = image.obj;
    }
    build() {
        console.log("build");
        console.log(this.image);
        console.log('^^^^^^^^');
        let imagePath = basePath + this.image.name;
        fs.mkdir(imagePath, () => {
            let config = JSON.parse(this.image.config);
            console.log(config);
            let fileName;
            if (config.config.provisioners) {
                if (config.config.provisioners[0].type === 'docker') {
                    fileName = 'Dockerfile';
                } else if (config.config.provisioners[0].type === 'shell') {
                    fileName = 'provision.shell.sh';
                }
                fs.writeFileSync(imagePath + '/' + fileName, this.image.script);
            }
            let machine = vagrant.create({
                cwd: imagePath,
                env: process.env
            });
            // machine.init('ubuntu/trusty64', obj, onInit);
            machine.init(config.config.vm.box, config, () => {
                this.imageInstance.set('status', 'builded');
                this.imageInstance.save(function(err, data) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    notificator.send('refresh', {});

                });
            });

        });
    }
    static buildedImages(callback) {
        let buildedImagesNames = [];
        fs.readdir(basePath, (err, folders) => {
            each(folders, (folderName, intCallback) => {
                fs.readdir(basePath + folderName, (err, files) => {
                    console.log(folderName);
                    console.log(files.includes('Vagrantfile'));
                    if (files.includes('Vagrantfile')) {
                        buildedImagesNames.push(folderName);
                    }
                    intCallback();
                });
            }, function(err) {
                if (err) {
                    console.log('error');
                    console.log(err);
                }
                console.log(buildedImagesNames);
                callback(buildedImagesNames);
            });
        });
    }

    static onlineInstances(callback) {
        vagrant.globalStatus(function(err, data) {
            if (err) {
                callback(err);
            }
            callback(null, data);

        });
    }

    run() {
        console.log('vagrant run!!!');
        console.log(this.image);
        let sourceImagePath = basePath + this.image.runCongif.imageName;
        let instancePath = basePath + this.image.runCongif.name;

        try {
            fs.statSync(sourceImagePath);
            if (fs.statSync(sourceImagePath).isDirectory()) {
                ncp(sourceImagePath, instancePath, function(err) {
                    if (err) {
                        return console.error(err);
                    }
                    let machine = vagrant.create({
                        cwd: instancePath,
                        env: process.env
                    });
                    machine.on('progress', function() {
                        console.log('download progress: ', [].slice.call(arguments));
                    });

                    machine.on('up-progress', function() {
                        console.log('up progress: ', [].slice.call(arguments));
                    });
                    //up and shutdown to complete the provisioning
                    machine.up('--provision', function(err, out) {
                        if (err) throw new Error(err);

                        machine.status(function(err, out) {
                            console.log('\nstatus\n');
                            console.log(out);

                        });
                    });
                });




            }

        } catch (e) {
            console.log('nope');
            console.log('image not foud');
        }
    }
    delete(callback) {
        let imagePath = basePath + this.image.name;

        try {

            fs.statSync(imagePath);
            if (fs.statSync(imagePath).isDirectory()) {
                let machine = vagrant.create({
                    cwd: imagePath,
                    env: process.env
                });
                machine.destroy((err, out) => {
                    if (err) {
                        console.log('err on destroy');
                        console.log(err);
                        return;
                    }
                    rimraf(imagePath, (err) => {
                        if (err) {
                            console.log('err on rm');
                            console.log(err);
                            callback(out);
                        }
                        callback(null, out);
                    });
                });
            }

        } catch (e) {
            console.log('nope');
            callback(null, {});
        }


    }
};
