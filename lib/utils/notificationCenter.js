/*jshint esversion: 6 */
const socketio = require('socket.io');

module.exports = class NotificationCenter {
  //we should not need this
  constructor() {
    this.clients = {};
  }
  start(httpserver){
    let io = socketio(httpserver);
    io.on('connection', (socket) => {
        socket.on('handshake', (uid) => {
            this.clients[uid] = socket;
            socket.emit('handshake', {
                success: true
            });
        });
    });
  }
};
