var socket = require('socket.io-client')('http://192.168.3.84:4001');
socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});
console.log(`send 123`)
// socket.emit('connection', function (data) {

// })
socket.emit('fresh', 123, function (data) {
    console.log(data);
})