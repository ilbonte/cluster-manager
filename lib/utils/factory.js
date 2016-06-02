/*jshint esversion: 6 */
const store = require('../utils/store.js');
const _ = require('lodash');

// var factory = function(type, obj) {
class Factory {
    constructor(type, obj) {
        this.type = type;
        this.obj = obj;
    }
    save(callback) {
        store(this.type).save(this.obj, callback);
    }
    //returns the update data or an error
    update(uid, callback) {
        store(this.type).update({
            uid
        }, this.obj, callback);
    }
    delete(uid, callback) {
        store(this.type).delete({
            uid
        }, callback);
    }
    //returns the raw objet
    getData() {
        return this.obj;
    }
    set(path, value) {
        _.set(this.obj, path, value);
    }

    static getAll(type) {
        var data = store(type).all().map(function(data) {
            return new Factory(type, data);
        });
        debugger;
        data.getData = function() {
            return data.map(function(item) {
                return item.getData();
            });
        };
        return data;
    }
    static findByUid(type, uid, f) {
        var data = store(type).find(uid);
        return f(data);
    }
}


module.exports = Factory;
