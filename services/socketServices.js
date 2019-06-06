/**EXPORT MODULES */
const io = require('socket.io')()
/**LOCAL MODULES */
const config = require('./config')
const { debug, info, warn, error } = require('./logger')

let socket = null

io.sockets.on('connection', function(Client) {
  debug(Client.request.connection.remoteAddress)
  socket = Client
})

io.listen(config.front.socket)

module.exports = io
