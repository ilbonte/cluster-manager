/*jshint esversion: 6 */
const fs = require('fs');
const _ = require('lodash');
const storePath = './lib/store/data.json';
let _data = null;

fs.readFile(storePath, (err, data) => {
  if (err) throw err;
  _data=JSON.parse(data); //throw...
});

function generateUid() {
    return Math.random().toString(36).substring(2, 22);
}

function saveData(obj, callback) {
    fs.writeFile(storePath, JSON.stringify(_data, null, 2), (err) => {
        if (err) {
            console.error('Error writing in the store: ' + err);
            callback('Error writing in the store: ' + err, null);
        } else {
            callback(null, obj);
        }
    });
}

module.exports = function(moduleName) {
    if (!_data[moduleName]) {
        _data[moduleName] = [];
        saveData([], function() {});
    }

    var wrapper = {
        _store: _data[moduleName],
        save(obj, callback) {
            obj.uid = generateUid();
            this._store.push(obj);
            saveData(obj, callback);
        },
        update(query, updates, callback) {
            var current = this.find(query);
            if (current) {
                _.assign(current, updates);
                saveData(current, callback);
            } else {
                callback('Cannot update: item with id ' + query.uid + ' not found', null);
            }

        },
        delete(query, callback) {
            var index = _(this._store).findIndex(query);
            if (index > -1) {
                let removed = this._store.splice(index, 1);
                saveData(removed, callback);
            } else {
                callback('Cannot remove: item with id ' + query.uid + ' not found', null);
            }
        },
        //returns the object or undefined if not found
        find(query) {
            return _(this._store).find(query);
        },
        //returns the content of the module. a empty array if not present
        all() {
            return this._store;
        }

    };

    return wrapper;
};




/*vagrant template*/
// see: https://github.com/edin-m/node-vagrant/blob/bde23c5f8c332d84df416a87b7cb8763695aff2c/test/example2.config.json
//
// and future developments
