/*jshint esversion: 6 */
const Template = require('../models/template.js');

module.exports = function(app) {
    app.get('/v1/templates', function(req, res) {
        res.send(Template.getAll().getData());
    });
};
