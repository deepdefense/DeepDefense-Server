const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const path = require('path')

// session
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const cookieParser = require('cookie-parser')
// body parse
const bodyParser = require('body-parser')

// local require
var config = require('./config.js')
var { debug, info, warn, error } = require('./logger.js')
var user = require('../collections/user.js')
const conf = require('../collections/config')
var auth = require('../middlewares/isAuth.js') //  认证判断
const repository = require('../collections/repository')
const dockerImage = require('../collections/image')
const dockerRepository = require('./dockerRepository')
const timedScan = require('./timedScan')
const { dbException } = require('../class/exceptions')

var sessionOption = {
  resave: true, //  save the session to the session store
  saveUninitialized: true, //
  secret: 'uwotm8',
  cookie: {
    path: '/', //  cookie
    httpOnly: true, //  use http or https
    secure: false,
    maxAge: null //  expires time in millionsecond
    // expires: ,
  }
  // name:
  // proxy:
  // rolling:
  // store:
  // unset:
}

// main logical
function startApp() {
  console.log('welcome to use, server is going to start')
  var app = express()
  connectToMongodb()
  initApp(app)
  /**ready to update image collections */
  setInterval(function() {
    timedScan
      .needScan()
      .then(function(data) {
        return new Promise((resolve, rejecrt) => {
          if (data) {
            conf
              .findOneAndUpdate(
                {
                  key: 'TIMEDSCAN'
                },
                {
                  $set: {
                    config: {
                      lastScan: parseInt(new Date().getTime()),
                      interval: 1000 * 60 * 60 * 24
                    }
                  }
                }
              )
              .then(data => {
                if (data) {
                  resolve()
                } else {
                  throw new dbException(`No timed scan config`)
                }
              })
              .catch(err => {
                warn(err)
              })
          } else {
            throw new Error(`nothing to do`)
          }
        })
      })
      .then(function() {
        repository
          .find({})
          .then(function(docs) {
            if (docs.length > 0) {
              docs.forEach(function(doc) {
                dockerRepository
                  .getImageByRepository(doc.repository)
                  .then(dockerRepository.getTagByImage)
                  .then(dockerRepository.analyzeImage)
                  .catch(function(err) {
                    warn(err)
                  })
              })
            }
          })
          .catch(function(err) {
            throw new dbException(err)
          })
      })
      .catch(function(err) {
        if (err.message !== `nothing to do`) {
          warn(err)
        } else {
          debug(`fresh check`)
        }
      })
  }, 1000 * 60)
  var server = http.Server(app)
  server.listen(app.get('port'), function() {
    info('listen at port:' + app.get('port'))
  })
}

/**
 * inie app
 * @param {express()} app
 */
function initApp(app) {
  app.set('port', config.port.http)
  // load body parse middleware
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())

  // load seesion middleware
  app.use(session(sessionOption)) //  session处理

  // config and load passport
  // cookie验证
  passport.use(new LocalStrategy(user.authenticate())) // 设置passport验证策略
  passport.serializeUser(user.serializeUser()) // passport将user对象序列化为cookie值
  passport.deserializeUser(user.deserializeUser()) //  passport将cookie值反序列化为user对象
  app.use(passport.initialize()) //  passport初始化
  app.use(passport.session()) //  引入passport的session, passport会检查cookie并填充req.user

  // load static source
  // app.use(express.static(path.join(__dirname, 'public')))
  debug('middware load done')

  // 添加response header, 解决跨域问题
  app.use(require('../middlewares/resHeader'))

  // app.use('/auth', require('./routers/index.js'));  // 认证
  //   app.use('/', express.static('../'))
  app.use(express.static(path.join(__dirname, '/../public')))
  app.use('/static', express.static(path.join(__dirname, '/../public')))
  app.use('/api/repository', auth, require('../routers/repositoryRouter'))
  app.use('/api/scanner', auth, require('../routers/scannerRouter'))
  app.use('/api/score', auth, require('../routers/scoreRouter'))
}

/**
 * connecte to the mongodb
 */
function connectToMongodb() {
  function connect() {
    var options = {
      // server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
      // replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
      useNewUrlParser: true
    }
    debug(config.database)
    var connct = mongoose.connect(config.database.toString(), options)
  }

  connect() // connect to the mongodb
  mongoose.connection
    .on('error', err => {
      error(err)
    })
    .on('disconnected', () => {
      connect() // reconnect to the mongodb
    })
    .on('open', () => {
      info('connect to the ' + config.database.toString())
    })
}

module.exports = {
  startApp,
  connectToMongodb
}
