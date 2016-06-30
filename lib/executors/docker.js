/*jshint esversion: 6 */
const _ = require('lodash/core');
const Docker = require('dockerode');
const stream = require('stream');
const fs = require('fs');
const tar = require('tar-stream');
const NotificationCenter = require('../utils/notificationCenter');
const notificator = new NotificationCenter();
const each = require("async/each");


function _createDockerfile(dockerobject) {
    let dockerstring = '';
    dockerobject.forEach((item) => {
        dockerstring += item.instruction.toUpperCase() + ' ' + item.arguments + '\n';
    });

    return dockerstring;
}
//TODO: move to config file
const docker = new Docker({
    host: '127.0.0.1',
    port: 4243
}); //defaults to http


module.exports = class DockerPlatform {
    constructor(image) {
        this.imageInstance = image;
        this.image = image.obj;
    }

    build() {
        function callback(err, result) {
            //not sure if this works
            if (err) {
                console.log('docker: error');
            } else {
                //should send the inserted image
                console.log('docker: saved');
            }
        }

        let onFinished = (err, output) => {
            if (err) {
                // TODO: what should i do here?
                console.log('error on followprogress:');
                console.log(output);
                this.imageInstance.set('status', 'failed');

            } else {
                console.log('build finished:');
                // console.log(output);
                this.imageInstance.set('status', 'saved+builded');

            }

            this.imageInstance.set('log', output);
            this.imageInstance.update(this.image.uid, callback);
            notificator.send('refresh', {});

        };

        console.log('sto buildando l imamgine di docker');

        const DOCKERFILE = _createDockerfile(this.image.config.build);

        let pack = tar.pack(); // pack is a streams2 stream
        let myFile = fs.createWriteStream('Dockerfile.tar');

        pack.entry({
            name: 'Dockerfile'
        }, DOCKERFILE, () => {
            pack.finalize();
        });
        pack.pipe(myFile);
        myFile.on('close', () => {
            var path = 'Dockerfile.tar'; //use process cwd?
            docker.buildImage(path, {
                t: this.image.name + ':' + this.image.tag
            }, (err, stream) => {
                if (err) {
                    // TODO: what should i do here?
                    console.log('error on building');
                    console.log(err);
                    return;
                } else {
                    docker.modem.followProgress(stream, onFinished);

                    // stream.pipe(process.stdout); //log to console...

                    stream.on('data', (chunk) => {
                        console.log('cK:' + chunk);
                        notificator.send('streamLog', {
                            log: JSON.stringify(JSON.parse(chunk.toString()), null, 2),
                            uid: this.image.uid
                        });
                    });

                }
            });
        });

    }

    run() {
        console.log('docker runnaaaa::');
        console.log(this.image);
        let PortBindings = this.createPortBinding(this.image.runCongif);
        console.log(PortBindings);
        docker.run(this.image.imageName, [], process.stdout, {
            PortBindings
        }, {}, function(err, data, container) {

            console.log('err');
            console.log(err);
            console.log("---------");

            console.log('data');
            console.log(data);
            console.log("---------");

            console.log('container');
            console.log(container);
            console.log("---------");
            this.imageInstance.set('status', 'exited');
            this.imageInstance.set('StatusCode', data);
            this.imageInstance.update(this.image.uid, report);
            notificator.send('refresh', {});

        }).on('container', (container) => {
          this.imageInstance.set('status', 'running');
          this.imageInstance.set('containerId', container.id);
          this.imageInstance.update(this.image.uid, report);
          console.log('onContainer');
          console.log(container);
          console.log('***********');
        });



    }

    delete(callback) {
        let image = docker.getImage(this.image.name + ':' + this.image.tag);
        image.remove({
            force: true
        }, function(err, data) {
            notificator.send('refresh', {});
            if (err) {
                callback(err);

            } else {
                callback(null, data);
            }

        });
    }

    createPortBinding(config) {
        let PortBindings = {};
        if (config.containerPort && config.hostPort) {
            let containerPort;
            if (config.protocol === 'both' || !config.protocol) {
                containerPort = config.containerPort+'/tcp';
                PortBindings[containerPort] = [];
                PortBindings[containerPort].push({
                  HostIp: config.hostIp,
                  HostPort: config.hostPort
                });
                containerPort = config.containerPort+'/udp';
                PortBindings[containerPort] = [];
                PortBindings[containerPort].push({
                  HostIp: config.hostIp,
                  HostPort: config.hostPort
                });
            } else {
                containerPort = config.containerPort + '/' + config.protocol;
                PortBindings[containerPort] = [];
                PortBindings[containerPort].push({
                  HostIp: config.hostIp,
                  HostPort: config.hostPort
                });
            }
        }
        return PortBindings;
    }

    static directDelete(imageName, callback) {
        let image = docker.getImage(imageName);
        image.remove({
            force: true
        }, function(err, data) {
            notificator.send('refresh', {});
            if (err) {
                callback(err);

            } else {
                callback(null, data);
            }

        });
    }

    static getContainers(callback) {
        console.log('listing containers');
        let retContainers = [];
        docker.listContainers(function(err, containers) {
            each(containers, (container, intCallback) => {
                docker.getContainer(container.Id).inspect(function(err, data) {
                    if (err) {
                        console.log('err');
                        console.log(err);
                        intCallback(err);
                    } else {
                        data.type = 'docker';
                        retContainers.push(data);
                        intCallback();
                    }
                });
            }, (err) => {
                callback(retContainers);
            });
        });
    }

    static onlineImages(callback) {
        docker.listImages({
            all: false
        }, function(err, images) {
          console.log(images);
            if (err) {
                callback(err);
            } else {
                callback(null, images);
            }

        });
    }
    static onlineContainers(callback) {
        docker.listContainers({
            all: true
        }, function(err, containers) {
            if (err) {
                callback(err);
            } else {
                callback(null, containers);
            }

        });

    }

    static inspectImage(name, callback) {
        var image = docker.getImage(name);
        console.log(name);
        // query API for image info
        image.inspect(function(err, data) {
            if (err) {
                callback(err);
            }
            callback(null, data);
        });
    }
};

function report(err, result) {
    //not sure if this works
    if (err) {
        console.log('docker: error');
    } else {
        //should send the inserted image
        console.log('docker...');
    }
}
