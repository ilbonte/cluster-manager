/*jshint esversion: 6 */
const Docker = require('../executors/docker.js');

Docker.getContainers((data)=>{
  console.log(data);
});
