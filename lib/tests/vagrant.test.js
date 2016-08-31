/*jshint esversion: 6 */
const Vagrant = require('../executors/vagrant');

var plat = new Vagrant({
    quacosa: "nasnd"
});

Vagrant.onlineInstances(callback);

// Vagrant.builtImages((res) => {
//     console.log('res');
//     console.log(res);
// });
