/*jshint esversion: 6 */
const Factory = require('../utils/factory.js');
const Executor = require('../utils/executor.js');
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

    saveAndRun(callback){
        this.instance.set('status', 'saved');
        this.instance.save(callback);
        this.run();
    }

    run(){
      var executor = new Executor(this.instance);
      executor.run();
    }
};
