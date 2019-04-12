const io = require('socket.io-client');
const { debug, info, warn, error } = require('./logger');
const { host, port } = require('./config').front;
const socket = io(``);

socket.on('connect', function () {
    info(`connect to the front`)
});
socket.on('event', function () {
    
});
socket.on('disconnect', function () {
    info(`error`)
});

module.exports = socket;