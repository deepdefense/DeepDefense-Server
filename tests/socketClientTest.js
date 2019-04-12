const socket = require('../services/socketClient');

console.log(`send a event 123`)
socket.emit('123', 111, 'abc', function (data) {
    console.log(`server response: ${data}`);
});