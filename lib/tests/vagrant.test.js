/*jshint esversion: 6 */
const Vagrant = require('../executors/vagrant');

var plat = new Vagrant({
    quacosa: "nasnd"
});

Vagrant.buildedImages((res) => {
    console.log('res');
    console.log(res);
});
