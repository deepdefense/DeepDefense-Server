const router = require('express').Router()
const config = require('../services/config')
const { debug, info } = require('../services/logger')

router.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Credentials', 'true')
  // res.header("Access-Control-Allow-Credentia","true")
  if (req.params[0] == `/socket.io/`) {
    next()
    return
  }
  info(`${req.method}: http://BASICK_URL:${config.port.http}${req.path}\nbody: ${req.body ? JSON.stringify(req.body) : `NO BODY`}`)
  next()
})

module.exports = router
