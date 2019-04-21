const { startApp } = require('./services/express')

if (process.argv[2] && process.argv[2] == 'dev') {
  process.env.NODE_ENV = 'dev'
} else {
  process.env.NODE_ENV = 'pro'
}

startApp()
