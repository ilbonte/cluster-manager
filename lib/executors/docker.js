/*jshint esversion: 6 */
const _ = require('lodash/core');
const Docker = require('dockerode');
const stream = require('stream');
const fs = require('fs');
const tar = require('tar-stream');

function _createDockerfile(image) {
    return 'FROM hello-world\n';
}

const docker = new Docker({
    host: '127.0.0.1',
    port: 4243
}); //defaults to http



module.exports = class DockerPlatform {
    constructor(image) {
        console.log("Docker executor not implemented yet");
        this.image = image;
    }
    build() {
        console.log('sto buildando l imamgine di docker');
        const DOCKERFILE = _createDockerfile(this.image);

        var pack = tar.pack(); // pack is a streams2 stream
        var myFile = fs.createWriteStream('Dockerfile.tar');

        pack.entry({
            name: 'Dockerfile'
        }, DOCKERFILE, () => {
            pack.finalize();
        });
        pack.pipe(myFile);

        myFile.on('close', () => {
            var path = 'Dockerfile.tar';

            console.log('buildo image');
            docker.buildImage(path, {
                t: "insert_tag_here"
            }, (err, stream) => {

                if (err) {
                    console.log('error on build');
                    console.log(err);
                    // TODO: callback here_??
                    return;
                }


                docker.modem.followProgress(stream, onFinished);
                var buildSuccessful = true;

                function onFinished(err, output) {
                    //output is an array with output json parsed objects
                    //...
                    if (err) {

                        buildSuccessful = false;
                        console.log('errore on fished:');
                        console.log(err);
                        console.log(output);
                        return;
                    }

                    console.log('onFinished:');
                    console.log(output);
                    //save log to db
                    // TODO: callback...
                    // onImageBuild({
                    //     type: 'log',
                    //     payload: output
                    // });
                }

                stream.on('data', (chunk) => {
                  //TODO: send data using socket.io
                    // onStreamData({
                    //     type: 'message',
                    //     payload: chunk.toString()
                    // });
                });

                 stream.pipe(process.stdout); //log to console...

                stream.on('end', function() {
                    // onStreamData({
                    //     type: 'end',
                    //     payload: buildSuccessful
                    // });
                    console.log('stream finito!');
                });
            });
        });
    }
};
