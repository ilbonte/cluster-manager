/*jshint esversion: 6 */
const _ = require('lodash/core');
const Docker = require('dockerode');
const stream = require('stream');
const fs = require('fs');
const tar = require('tar-stream');

function _createDockerfile(dockerobject) {
  let dockerstring = '';
  dockerobject.forEach((item)=> {
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

    this.image = image;
  }

  build() {
    console.log('sto buildando l imamgine di docker');

    const DOCKERFILE = _createDockerfile(this.image.config.build);
    console.log(DOCKERFILE);
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
      docker.buildImage(path,{t:this.image.name+':'+this.image.tag}, (err,stream) => {
        if(err){
          // TODO: what should i do here?
          console.log('error on building');
          console.log(err);
          return;
        } else{
          docker.modem.followProgress(stream, onFinished);
          function onFinished(err,output) {
            if(err){
              // TODO: what should i do here?
              console.log('error on followprogress:');
              console.log(output);
              return;
            }

            console.log('build finished:');
            console.log(output);


          }
          stream.pipe(process.stdout); //log to console...

          // stream.on('data', (chunk)=> {
          //   console.log('...');
          //   console.log(chunk.toString());
          // });

        }
      });
    });

    // myFile.on('close', () => {
    //     var path = 'Dockerfile.tar'; //use process cwd?
    //
    //     console.log('buildo image');
    //     docker.buildImage(path, {
    //         t: "insert_tag_here"
    //     }, (err, stream) => {
    //
    //         if (err) {
    //             console.log('error on build');
    //             console.log(err);
    //             // TODO: callback here_??
    //             return;
    //         }
    //
    //
    //         docker.modem.followProgress(stream, onFinished);
    //         var buildSuccessful = true;
    //
    //         function onFinished(err, output) {
    //             //output is an array with output json parsed objects
    //             //...
    //             if (err) {
    //
    //                 buildSuccessful = false;
    //                 console.log('errore on fished:');
    //                 console.log(err);
    //                 console.log(output);
    //                 return;
    //             }
    //
    //             console.log('onFinished:');
    //             console.log(output);
    //             //save log to db
    //             // TODO: callback...
    //             // onImageBuild({
    //             //     type: 'log',
    //             //     payload: output
    //             // });
    //         }
    //
    //         stream.on('data', (chunk) => {
    //             //TODO: send data using socket.io
    //             // onStreamData({
    //             //     type: 'message',
    //             //     payload: chunk.toString()
    //             // });
    //         });
    //
    //         stream.pipe(process.stdout); //log to console...
    //
    //         stream.on('end', function() {
    //             // onStreamData({
    //             //     type: 'end',
    //             //     payload: buildSuccessful
    //             // });
    //             console.log('stream finito!');
    //         });
    //     });
    // });
  }

  run() {
    console.log('docker run...');
    docker.listImages({all: true}, function (err, images) {
      console.log(images);

    });
    docker.listContainers({all: true}, function (err, images) {
      console.log("containers:");
      console.log(images);

    });

  }

  static getAllImages() {

  }
};
