/*jshint esversion: 6 */
const Factory = require('../utils/factory.js');
const Executor = require('../utils/executor.js');
const Docker = require('../executors/docker.js');
const Vagrant = require('../executors/vagrant.js');
const parallel = require("async/parallel");
const _ = require('lodash');
module.exports = class Instance {
    //we should not need this
    constructor(uid, body) {
        let fromImage = new Factory('images', Factory.findByUid('images', uid));
        let instance = {
            name: fromImage.obj.name,
            type: fromImage.obj.type,
            image: fromImage.obj.uid,
            runCongif: body
        };
        if (fromImage.obj.type === 'docker') {
            instance.imageName = fromImage.obj.name + ':' + fromImage.obj.tag; //TODO potrebbe non avere i :
        }
        this.instance = new Factory('instances', instance);
    }

    saveAndRun(callback) {
        this.instance.set('status', 'saved');
        this.instance.save(callback);
        this.run();
    }

    run() {
        let executor = new Executor(this.instance);
        executor.run();
    }
    static getAll(sendCallback) {
        let dockerSavedInstances = Factory.getAllByType('instances', 'docker');
        let vagrantSavedInstances = Factory.getAllByType('instances', 'vagrant');

        parallel({
                vagrant: function(callback) {
                    Vagrant.onlineInstances(function(err,data){
                      if (err) {
                          callback(err);
                      }
                      callback(null, data);
                    });
                },
                docker: function(callback) {
                    Docker.onlineContainers(function(err,data){
                      if (err) {
                          callback(err);
                      }
                      callback(null, data);
                    });
                }
            },
            function(err, results) {
              console.log('instances');
                console.log(results);
                let mergedDocker=_mergeDocker(results.docker,dockerSavedInstances);
                let mergedVagrant=_mergVagrant(results.vagrant,vagrantSavedInstances);
                mergedDocker.push(...mergedVagrant);
                sendCallback(mergedDocker);
            });

    }


};
 function _mergeDocker(onlineData, savedData){
   let ret=[];
   let savedIds=savedData.map(item => item.containerId);
   let onlineIds=onlineData.map(item =>item.Id);
   let both=_.intersection(savedIds,onlineIds);
   let onlyOnline = _.difference(onlineIds, savedIds);
   let onlySaved = _.difference(savedIds, onlineIds);
   both.forEach(id =>{
     let [saved] = savedData.filter(item => item.containerId === id);
     let [online] = onlineData.filter(item => item.Id === id);
     saved.status=online.State+'saved';
     saved.inspect=online;
     ret.push(saved);
   });

   onlyOnline.forEach(id =>{
     let [online] = onlineData.filter(item => item.Id === id);
     online.status=online.State;
     online.inspect=online;
     online.type='docker';
     online.name=Names[0];
     online.uid=online.Id;
     ret.push(online);
   });

   both.forEach(id =>{
     let [saved] = savedData.filter(item => item.containerId === id);
     saved.status='saved';
     ret.push(saved);
   });
   return ret;
 }

 function _mergVagrant(onlineData, savedData){
   let ret=[];
  //  let savedIds=savedData.map(item => item.containerId);
  //  let onlineIds=onlineData.map(item =>item.Id);
  //  let both=_.intersection(savedIds,onlineIds);
  //  let onlyOnline = _.difference(onlineIds, savedIds);
  //  let onlySaved = _.difference(savedIds, onlineIds);
  //  both.forEach(id =>{
  //    let [saved] = savedData.filter(item => item.containerId === id);
  //    let [online] = onlineData.filter(item => item.Id === id);
  //    saved.status=online.State+'saved';
  //    saved.inspect=online;
  //    ret.push(saved);
  //  });
   //
  //  onlyOnline.forEach(id =>{
  //    let [online] = onlineData.filter(item => item.Id === id);
  //    online.status=online.State;
  //    online.inspect=online;
  //    online.type='docker';
  //    online.name=Names[0];
  //    online.uid=online.Id;
  //    ret.push(online);
  //  });
   //
  //  both.forEach(id =>{
  //    let [saved] = savedData.filter(item => item.containerId === id);
  //    saved.status='saved';
  //    ret.push(saved);
  //  });
  return ret;
 }
