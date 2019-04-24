const io = require('socket.io')()
const { debug, info, warn, error } = require('./logger')

io.sockets.on('connection', function(Client) {
  //   info(Client.request.connection.remoteAddress)
})

// io.listen(4001)

module.exports = io
