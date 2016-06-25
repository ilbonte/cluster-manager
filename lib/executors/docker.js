/*jshint esversion: 6 */
const _ = require('lodash/core');
const Docker = require('dockerode');
const stream = require('stream');
const fs = require('fs');
const tar = require('tar-stream');
const NotificationCenter = require('../utils/notificationCenter');
const notificator = new NotificationCenter();

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
        this.image = image.getData();
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
            notificator.send('refresh',{});
            
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
                      console.log('cK:'+chunk);
                        notificator.send('streamLog', {log:JSON.stringify(JSON.parse(chunk.toString()),null,2),uid:this.image.uid});
                    });

                }
            });
        });

    }

    run() {
        console.log('docker run...');
        docker.listImages({
            all: true
        }, function(err, images) {
            // console.log(images);
            //TODO:
        });
        // docker.listContainers({
        //     all: true
        // }, function(err, images) {
        //     console.log("containers:");
        //     console.log(images);
        //
        // });

    }

     delete(callback){
       var image = docker.getImage(this.image.name+':'+this.image.tag);
       image.remove ({
         force:true
       }, function(err, data) {
         notificator.send('refresh',{});
           if (err) {
               callback(err);

           } else {
               callback(null, data);
           }

       });
    }

    static onlineImages(callback) {
        docker.listImages({
            all: true
        }, function(err, images) {
            if (err) {
                callback(err);
            } else {
                callback(null, images);
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
