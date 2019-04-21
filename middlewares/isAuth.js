const config = require('../services/config')

function auth(req, res, next) {
  if (!config.auth) {
    next()
  } else {
    if (req.user) {
      next()
    } else {
      res.statusCode = 300
      res.json({
        data: null,
        message: 'no authentication'
      })
    }
  }
}

module.exports = auth
