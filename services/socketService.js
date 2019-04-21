const io = require('socket.io')()
const { debug, info, warn, error } = require('./logger')

module.exports = io.on('connection', function(Client) {
  info()
})
