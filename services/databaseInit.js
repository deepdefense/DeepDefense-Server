const User = require('../collections/user')
const Config = require('../collections/config')
const { debug, info, warn, err } = require('./logger')
const { dbException } = require('../class/exceptions')

const logInUserInit = () => {
  User
    .deleteMany({})
    .then(() => {
      return new Promise((resolve, reject) => {
        User
          .register(
            {
              username: 'admin',
              role: 'admin'
            },
            'admin123'
          )
          .then(data => {
            if (data) {
              info(`user init`)
            } else {
              throw new Error(`user init fail`)
            }
          })
          .catch(err => {
            error(err)
          })
      })
    })
    .catch(err => {
      error(err)
    })
}

const scoreRightInit = () => {
  Config
    .deleteMany({ key: 'SCORE' })
    .then(() => {
      return new Promise((resolve, reject) => {
        Config
          .create({
            key: 'SCORE',
            description: 'score right config',
            config: {
              high: 8,
              medium: 4,
              low: 1,
              negligible: 0.2,
              unknown: 0.1
            }
          })
          .then(doc => {
            resolve(doc)
          })
          .catch(err => {
            reject(err)
          })
      })
    })
    .then(data => {
      info(`score right init`)
    })
    .catch(err => {
      error(err)
    })
}

const databaseInit = () => {
  return new Promise((resolve, reject) => {
    Config.findOne({ key: 'ISINIT' })
      .then(doc => {
        return new Promise((resolve, reject) => {
          if (doc && doc.config) {
            info(`database is already init`)
            reject(new Error(`exit`))
          } else {
            resolve()
          }
        })
      })
      .then(() => {
        logInUserInit()
        scoreRightInit()
        Config.create({
          key: 'ISINIT',
          description: 'database init flage',
          config: true
        }).then(data => {
          info(`database init`)
        }).catch(err => {
          throw new dbException(err)
        })
      })
      .catch(err => {
        if (err.message == 'exit') {
          info(`database init`)
        } else {
          warn(JSON.stringify(err.stack))
        }
      })
  })
}

module.exports = {
  logInUserInit,
  scoreRightInit,
  databaseInit
}