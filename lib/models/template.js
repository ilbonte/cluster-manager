/*jshint esversion: 6 */
const Factory = require('../utils/factory.js');

module.exports = class Template {
  //we should not need this because templates are already defined
  constructor() {
    console.log('Template constructor not implemented yet');
  }
  static getAll(){

    return Factory.getAll('templates');

  }
};
