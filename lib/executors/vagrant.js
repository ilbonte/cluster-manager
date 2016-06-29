/*jshint esversion: 6 */
const fs = require('fs');
const vagrant = require('node-vagrant');
const basePath = 'C:/rewiteRepo/';
const NotificationCenter = require('../utils/notificationCenter');
const notificator = new NotificationCenter();
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
                    'build_image "/vagrant", args: "-t my-name/my-new-image"',
                    'run "my-name/my-new-image"'
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
        this.imageInstance = image;
        this.image = image.obj;
    }
    build() {
        console.log("build");
        console.log(this.image);
        console.log('^^^^^^^^');
        let imagePath=basePath+this.image.name;
        fs.mkdir(imagePath, ()=>{
          let config=JSON.parse(this.image.config);
          console.log(config);
          let fileName;
            if(config.config.provisioners[0].type==='docker'){
               fileName='Dockerfile';
            }else if(config.config.provisioners[0].type==='shell'){
              fileName='provision.shell.sh';
            }
            fs.writeFileSync(imagePath+'/'+fileName, this.image.script);
            let machine = vagrant.create({
              cwd: imagePath,
              env: process.env
            });
            // machine.init('ubuntu/trusty64', obj, onInit);
            machine.init(config.config.vm.box, obj, () =>{
              this.imageInstance.set('status','builded');
              this.imageInstance.save(function(err,data){
                if(err){
                  console.log(err);
                  return;
                }
                notificator.send('refresh', {});

              });
            });
            // function onInit(err, out) {
            //     if (err) throw new Error(err);
            //
            //     machine.on('progress', function() {
            //         console.log('download progress: ', [].slice.call(arguments));
            //     });
            //
            //     machine.on('up-progress', function() {
            //         console.log('up progress: ', [].slice.call(arguments));
            //     });
            //     //up and shutdown to complete the provisioning
            //     machine.up('--provision',function(err, out) {
            //         if (err) throw new Error(err);
            //
            //         machine.status(function(err, out) {
            //             console.log('\nstatus\n');
            //             console.log(err, out);
            //
            //
            //                 // machine.halt(function(err, out) {
            //                 //     console.log('\nhalt33\n');
            //                 //     console.log(err, out);
            //                 //
            //                 // });
            //
            //         });
            //     });
            // }
        });



    }
    run() {
        console.log('vagrant run');
    }
};
