const router = require('express').Router()
const { info } = require('../services/logger')

router.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Credentials', 'true')
  // res.header("Access-Control-Allow-Credentia","true")

  if (req.body && req.body !== '') {
    info(`request.body: ${JSON.stringify(req.body)}`)
  }
  if (req.query && req.query !== '') {
    info(`request.query: ${JSON.stringify(req.params)}`)
  }
  next()
})

module.exports = router
