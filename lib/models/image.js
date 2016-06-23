/*jshint esversion: 6 */
const Factory = require('../utils/factory.js');
const Executor = require('../utils/executor.js');
const Docker = require('../executors/docker.js');

const _ = require('lodash/core');
module.exports = class Image {
        //we should not need this
        constructor(file) {
            this.image = new Factory('images', file);
        }

        save(callback) {
            this.image.set('status', 'saved'); //TODO: scommentare questo
            this.image.save(callback);

            this.build(); //privato _?
        }

        build() {
            var executor = new Executor(this.image);
            executor.build();
        }
        update(callback) {
            let {
                uid,
                status
            } = this.image.getData();
            // if(status==="building"){
            //TODO: at this point type should be docker and not docker-template
            // this.build();
            // }
            this.image.update(uid, callback);
        }
        static getAllFromFactory() {
            return Factory.getAll('images');
        }


        //return all images present in docker/vagrant and in the data.json combining them when possible
        // static exp(callback) {
        //
        //     Executor.onlineImages('docker', (err, images) => {
        //         if (err) {
        //             //TODO: hadle error
        //
        //         } else {
        //             onDockerBuildedImages(images);
        //         }
        //     });
        //     let dockerSavedImages = Factory.getAllByType('images', 'docker');
        //
        //     function onDockerBuildedImages(dockerBuildedImages) {
        //       console.log(dockerBuildedImages);
        //       let returnedImages=[];
        //         dockerSavedImages.forEach((savedImage) => {
        //             const fullName = savedImage.name + ':' + savedImage.tag;
        //             console.log(fullName);
        //             dockerBuildedImages.forEach((buildedImage)=>{
        //               if(buildedImage.RepoTags.includes(fullName)){
        //                 savedImage.daDocker=buildedImage;
        //                 returnedImages.push(savedImage)
        //               }
        //             })
        //             var found=true;
        //
        //             if(found){
        //               returnedImages.push(found);
        //             }
        //         });
        //         callback(returnedImages);
        //     }
        // }
        static exp () {
            Docker.inspectImage('ubuebon:1.0', (err, data) => {
                if (err) {
                    console.log('err');
                    console.log(err);
                } else {
                    console.log(data);
                }
            });
        }
};
