/*jshint esversion: 6 */
const socketio = require('socket.io');
let client;
module.exports = class NotificationCenter {
  //we should not need this
  constructor() {
    this.client = null;
  }
  start(httpserver){
    let self=this;
    let io = socketio(httpserver);
    io.on('connection', (socket) => {
      console.log('connected');
      client = socket;
    });
  }
  send(type,data){
    if(type)
      client.emit(type,data);
  }
};
