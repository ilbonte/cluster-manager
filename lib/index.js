/*jshint esversion: 6 */

const express = require('express');
const rd = require('require-directory');
const bodyParser = require('body-parser');
const app = express();
// const notificationCenter = require('./utils/notificationCenter');  //<----socket.io

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); //<<--add example.com
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(bodyParser.json());
app.use(allowCrossDomain);
var resources = rd(module, './resources');

for (var key in resources) {
  if (resources.hasOwnProperty(key)) {
    resources[key](app);
  }
}

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('running at http://' + host + '-:-' + port);
});

// notificationCenter.start(server);  //<----socket.io
