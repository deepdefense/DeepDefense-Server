var socket = require('socket.io-client')('http://192.168.3.124:4001');
socket.on('connect', function () {
  console.log(`on connect`)
});
socket.on('event', function (data) { });
socket.on('disconnect', function () { });
// socket.emit('connection', function (data) {

// })
// socket.emit('fresh', 123, function (data) {
//     console.log(data);
// })

socket.on('fresh', (data) => {
  console.log(data)
})