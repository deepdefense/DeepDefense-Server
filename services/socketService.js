const io = require('socket.io')()
const { debug, info, warn, error } = require('./logger')

let socket = null

io.sockets.on('connection', function (Client) {
  debug(Client.request.connection.remoteAddress)
  socket = Client
})

io.listen(4001)

module.exports = io
