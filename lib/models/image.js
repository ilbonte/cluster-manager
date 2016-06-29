/*jshint esversion: 6 */
const Factory = require('../utils/factory.js');
const Executor = require('../utils/executor.js');
const Docker = require('../executors/docker.js');
const Vagrant = require('../executors/vagrant.js');
const each = require("async/each");
const _ = require('lodash');
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
    delete(callback) {
        console.log('in model:');
        console.log(this.image);
        var executor = new Executor(this.image);
        this.image.delete(callback); //TODO: move outside?
        if (this.image.getData().status !== 'failed') {
            executor.delete((err, data) => {
                if (err) {
                    console.log('err');
                    console.log(err);

                } else {
                    console.log('data');
                    console.log(data);
                }
            });
        }

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

    static findByUid(uid) {
        return new Factory('images', Factory.findByUid('images', uid));
    }

    static getAllFromFactory() {
        return Factory.getAll('images');
    }

    static directDelete(imageName, callback) {
        Docker.directDelete(imageName, callback);
    }


    //return all images present in docker/vagrant and in the data.json combining them when possible
    static getAll(callback) {
        let dockerSavedImages = Factory.getAllByType('images', 'docker');
        let vagrantSavedImages = Factory.getAllByType('images', 'vagrant');

        Docker.onlineImages((err, images) => {
            if (err) {
                //TODO: hadle error

            } else {
                onDockerBuildedImages(images);
            }
        });





        function onDockerBuildedImages(dockerBuildedImages) {
            let retImg = [];




            // console.log(dockerBuildedImages);
            let buildedImagesNames = []; //TODO: need to apply uniq?
            dockerBuildedImages.forEach((savedImage) => {
                buildedImagesNames.push(...savedImage.RepoTags);
            });
            let bothNames = _.intersection(dockerSavedImages.map(item => item.name + ':' + item.tag), buildedImagesNames);
            let onlyBuilded = _.difference(buildedImagesNames, dockerSavedImages.map(item => item.name + ':' + item.tag));
            let onlySaved = _.difference(dockerSavedImages.map(item => item.name + ':' + item.tag), buildedImagesNames);
            // console.log(bothNames);
            // console.log(onlyBuildedNames);
            // console.log(onlySavedNames);
            mergeInfo(callback);

            function mergeInfo(callback) {
                each(bothNames, (itemName, intCallback) => {
                    let [name,
                        tag
                    ] = itemName.split(':');
                    let [image] = dockerSavedImages.filter(itemImage => itemImage.name === name && itemImage.tag === tag);
                    // console.log(image);
                    Docker.inspectImage(itemName, (err, data) => {
                        if (err) {
                            console.log('err');
                            console.log(err);
                            intCallback(err);
                        } else {
                            image.inspect = data;
                            retImg.push(image);
                            // console.log(data);
                            intCallback();
                        }
                    });

                }, function(err) {
                  /***********************************************/
                  /***********************************************/
                  Vagrant.buildedImages((vagrantNames)=>{
                    onVagrantBuildedImages(vagrantNames);
                  });      
                  function onVagrantBuildedImages (vagrantBuildedNames){
                    let vagrantSavedNames=vagrantSavedImages.map(image=> image.name);
                    let bothNames=_.intersection(vagrantSavedNames,vagrantBuildedNames);
                    let onlyBuilded = _.difference(vagrantBuildedNames, vagrantSavedNames);
                    let onlySaved = _.difference(vagrantSavedNames, vagrantBuildedNames);
                    console.log(vagrantSavedNames);
                    console.log(bothNames);
                    console.log(onlyBuilded);
                    console.log(onlySaved);
                    console.log('***********');
                    bothNames.forEach((name)=>{
                      let [image] = vagrantSavedImages.filter(itemImage => itemImage.name === name);
                      image.status='saved+builded';
                      retImg.push(image);
                    });
                    onlySaved.forEach((name)=>{
                      let [image] = vagrantSavedImages.filter(itemImage => itemImage.name === name);
                      image.status='saved';
                      retImg.push(image);
                    });
                    onlyBuilded.forEach((name)=>{
                      let image={};
                      image.name=name;
                      image.type='vagrant';
                      image.status='builded';
                      retImg.push(image);
                    });
                  }
                  /***********************************************/
                  /***********************************************/
                    // if any of the file processing produced an error, err would equal that error
                    if (err) {
                        // One of the iterations produced an error.
                        // All processing will now stop.
                        console.log('An image failed to process in bothNames');
                    } else {
                        console.log('All files have been processed successfully in bothNames');
                        //now we do the same with onlyBuilded
                        each(onlyBuilded, (itemName, intCallback) => {

                            Docker.inspectImage(itemName, (err, data) => {
                                if (err) {
                                    console.log('err');
                                    console.log(err);
                                    intCallback(err);
                                } else {
                                    data.type = 'docker';
                                    data.uid = data.Id;
                                    data.status = 'builded';
                                    retImg.push(data);
                                    intCallback();
                                }
                            });

                        }, function(err) {
                            // if any of the file processing produced an error, err would equal that error
                            if (err) {
                                // One of the iterations produced an error.
                                // All processing will now stop.
                                console.log('An image failed to process in onlyBuilded');
                            } else {
                                console.log('All files have been processed successfully');
                                //now we add the images that we have only on the db:
                                // dockerSavedImages.forEach(item=>{
                                //
                                // });
                                retImg.push(...dockerSavedImages.filter(item => onlySaved.includes(item.name + ':' + item.tag)));
                                callback(retImg);
                            }
                        });
                    }
                });
            }
        }

    }
};
