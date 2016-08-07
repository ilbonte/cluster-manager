/*jshint esversion: 6 */
const Factory = require('../utils/factory.js');
const Executor = require('../utils/executor.js');
const Docker = require('../executors/docker.js');
const Vagrant = require('../executors/vagrant.js');
const parallel = require("async/parallel");
const path = require('path');
const _ = require('lodash');
module.exports = class Instance {
  constructor() {

  }

  newInstance(instance) {
    this.instance = new Factory('instances', instance);
  }

  newInstanceFromImage(uid, body) {
    let fromImage = new Factory('images', Factory.findByUid('images', uid));
    let instance = {
      name: fromImage.obj.name,
      type: fromImage.obj.type,
      image: fromImage.obj.uid,
      runConfig: body
    };
    if (fromImage.obj.type === 'docker') {
      instance.imageName = fromImage.obj.name + ':' + fromImage.obj.tag;
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

  delete(callback) {
    let executor = new Executor(this.instance);
    this.instance.delete(callback);
    console.log('delte|data',this.instance.getData());
    let instance = this.instance.getData();
    //TODO: refactor codice duplicato
    if(instance.type==='docker'){
      if (instance.containerId) {
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
    }else if (instance.type==='vagrant'){
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

  static findByUid(uid) {
    return new Factory('instances', Factory.findByUid('instances', uid));
  }

  static getAll(sendCallback) {
    let dockerSavedInstances = Factory.getAllByType('instances', 'docker');
    let vagrantSavedInstances = Factory.getAllByType('instances', 'vagrant');

    parallel({
        vagrant: function (callback) {
          Vagrant.onlineInstances(function (err, data) {
            if (err) {
              callback(err);
            }
            callback(null, data);
          });
        },
        docker: function (callback) {
          Docker.onlineContainers(function (err, data) {
            if (err) {
              callback(err);
            }
            callback(null, data);
          });
        }
      },
      function (err, results) {
        let mergedDocker = _mergeDocker(results.docker, dockerSavedInstances);
        let mergedVagrant = _mergVagrant(results.vagrant, vagrantSavedInstances);
        mergedDocker.push(...mergedVagrant);
        console.log(mergedVagrant);
        sendCallback(mergedDocker); //TODO: send separate/ w/ socket.io for better UX
      });

  }


};
function _mergeDocker(onlineData, savedData) {
  let ret = [];
  let savedIds = savedData.map(item => item.containerId);
  let onlineIds = onlineData.map(item =>item.Id);
  let both = _.intersection(savedIds, onlineIds);
  let onlyOnline = _.difference(onlineIds, savedIds);
  let onlySaved = _.difference(savedIds, onlineIds);
  both.forEach(id => {
    let [saved] = savedData.filter(item => item.containerId === id);
    let [online] = onlineData.filter(item => item.Id === id);
    saved.status = 'saved+' + online.State;
    saved.inspect = online;
    ret.push(saved);
  });

  onlyOnline.forEach(id => {
    let [online] = onlineData.filter(item => item.Id === id);
    online.status = online.State;
    online.inspect = online;
    online.type = 'docker';
    online.name = online.Names[0];
    online.uid = online.Id;
    ret.push(online);
  });

  onlySaved.forEach(id => {
    let [saved] = savedData.filter(item => item.containerId === id);
    saved.status = 'saved';
    ret.push(saved);
  });
  return ret;
}

function _mergVagrant(onlineData, savedData) {
  console.log('elaboro',onlineData);
  let ret = [];
  //TODO: implemetare merfe

  let savedNames = savedData.map(item=> item.runConfig.name);
  let onlineNames = onlineData.map(extractVagrantName);
  let both = _.intersection(savedNames, onlineNames);
  let onlyOnline = _.difference(onlineNames, savedNames);
  let onlySaved = _.difference(savedNames, onlineNames);
  console.log('both', both);
  console.log('onlyOnline', onlyOnline);
  console.log('onlySaved', onlySaved);

  both.forEach(name => {
    let [saved] = savedData.filter(item => item.runConfig.name === name);
    let [online] = onlineData.filter(item => name===extractVagrantName(item));
    saved.status = 'saved+' + online.state;
    saved.inspect = online;
    ret.push(saved);
  });

  onlyOnline.forEach(name => {
    let [online] = onlineData.filter(item => name===extractVagrantName(item));
    online.status = online.state;
    online.type = 'vagrant';
    online.runConfig = {name};
    online.uid = online.id;
    ret.push(online);
  });



  onlySaved.forEach(name =>{
     let [saved] = savedData.filter(item => item.runConfig.name === name);
     saved.status='saved';
     ret.push(saved);
   });
  return ret;

  function extractVagrantName(item) {
    return path.parse(item.cwd).name;//TODO:improve this
  }
}
