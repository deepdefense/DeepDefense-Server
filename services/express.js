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
const vulnerability = require('../collections/vulnerability')
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
  setInterval(() => {
    repository
      .find({ isConnect: true })
      .then(repoDocs => {
        repoDocs.forEach(repoDoc => {
          dockerRepository
            .getImageByRepository({ repository: repoDoc.repository })
            .then(dockerRepository.getTagByImage)
            .then(data => {
              data = data.data
              //  add new image:tag
              data.images.forEach(image => {
                image.tags.forEach(tag => {
                  dockerImage
                    .findOneAndUpdate(
                      {
                        repository: `${data.repository}:${data.port}`,
                        image: image.image,
                        tag: tag
                      },
                      {
                        $setOnInsert: {
                          repository: `${data.repository}:${data.port}`,
                          image: image.image,
                          tag: tag,
                          isEnable: true
                        }
                      },
                      {
                        upsert: true,
                        new: true,
                        setDefaultsOnInsert: true
                      }
                    )
                    .then(doc => {
                      //TODO
                      //   debug(`${doc.repository}/${doc.image}:${doc.tag} update`)
                    })
                    .catch(err => {
                      warn(err.stack)
                    })
                })
              })
              //  remove unexited image:tag
              let imageList = []
              for (let image of data.images) {
                imageList.push(image.image)
              }
              //   debug(JSON.stringify(imageList))
              dockerImage
                .find({ repository: `${data.registory}:${data.port}` })
                .then(docs => {
                  docs.forEach(doc => {
                    if (!(imageList.indexOf(doc.image) > -1) || (imageList.indexOf(doc.image) > -1 && !data.images[imageList.indexOf(doc.image)].tags.indexOf(doc.tag) > -1)) {
                      dockerImage
                        .deleteOne(doc)
                        .then(data => {
                          //TODO
                          //   debug(`${doc.repository}/${doc.image}:${doc.tag} delete`)
                        })
                        .catch(err => {
                          warn(err.stack)
                        })
                    }
                  })
                })
                .catch(err => {
                  warn(err.stack)
                })
            })
        })
      })
      .catch(err => {
        warn(err.stack)
      })
  }, 1000 * 10)
  setInterval(() => {
    dockerImage.find({ score: -1, isEnable: true }).then(docs => {
      docs.forEach(doc => {
        repository
          .findOne({
            repository: doc.repository.split(':')[0]
          })
          .then(repoDoc => {
            return new Promise(resolve => {
              resolve({
                repository: repoDoc.repository,
                port: repoDoc.port,
                username: repoDoc.username,
                passwd: repoDoc.passwd,
                isHttps: repoDoc.isHttps,
                isAuth: repoDoc.isAuth,
                image: doc.image,
                tag: doc.tag
              })
            })
          })
          .then(dockerRepository.clairAnalyze)
          .then(analyzeResult => {
            // debug(JSON.stringify(analyzeResult.result))
            dockerImage
              .findOneAndUpdate(
                {
                  repository: analyzeResult.result.repository,
                  image: analyzeResult.result.image,
                  tag: analyzeResult.result.tag
                },
                {
                  $set: {
                    namespace: analyzeResult.result.namespace ? analyzeResult.result.namespace : '',
                    high: analyzeResult.result.high,
                    medium: analyzeResult.result.medium,
                    low: analyzeResult.result.low,
                    negligible: analyzeResult.result.negligible,
                    unknown: analyzeResult.result.unknown,
                    score: analyzeResult.result.score,
                    isEnable: true
                  }
                },
                { overwrite: true, new: true }
              )
              .then(data => {
                // TODO
                // debug(`updateONe`)
                // debug(JSON.stringify(data))
              })
              .catch(err => {
                warn(err.stack)
              })
            vulnerability
              .deleteMany({
                repository: analyzeResult.result.repository,
                image: analyzeResult.result.image,
                tag: analyzeResult.result.getTagByImage
              })
              .then(data => {
                analyzeResult.vulnerabilities.forEach(function(vul) {
                  vulnerability
                    .create({
                      repository: analyzeResult.result.repository,
                      image: analyzeResult.result.image,
                      tag: analyzeResult.result.tag,
                      cveId: vul.Name,
                      description: vul.Description,
                      link: vul.Link,
                      level: vul.Severity,
                      type: vul.VulName,
                      versionFormat: vul.VersionFormat,
                      version: vul.Version
                    })
                    .then(function(doc) {
                      //   debug('vulnerability save')
                    })
                    .catch(function(err) {
                      //   warn('vulnerability save fail')
                    })
                })
              })
              .catch(err => {
                warn(err.stack)
              })
          })
          .catch(err => {
            warn(err.stack)
            dockerImage
              .findOneAndUpdate(
                {
                  repository: doc.repository,
                  image: doc.image,
                  tag: doc.tag
                },
                {
                  $set: {
                    isEnable: false
                  }
                },
                { overwirte: true, new: true }
              )
              .then(data => {
                // TODO
                // debug(`disableOne`)
                // debug(JSON.stringify(data))
              })
              .catch(err => {
                warn(123)
                warn(err.stack)
              })
          })
      })
    })
  }, 1000 * 10)
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

  app.use('/api/auth', require('../routers/index.js')) // 认证
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
