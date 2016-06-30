var Docker = require('../executors/docker');
var getData = function() {
    console.log('hi');
};
var plat = new Docker({
    quacosa: "nasnd",
    getData: getData
});
// plat.run();
Docker.onlineContainers();
