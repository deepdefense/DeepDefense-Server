const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', function (client) {
    client.on('123', (data, data2) => {
        console.log(data);
        console.log(data2);
    });
});
server.listen(3000);