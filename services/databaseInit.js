/**export modules */
const path = require('path')
const fs = require('fs')
/**collections */
const User = require('../collections/user')
const Config = require('../collections/config')
const MonitorRule = require('../collections/monitorRule')
const MonitorList = require('../collections/monitorList')
/**local modules */
const { debug, info, warn, error } = require('./logger')
const { dbException } = require('../class/exceptions')

const { right, loginUser, rules, lists } = JSON.parse(fs.readFileSync(path.join(__dirname, `../config/init.json`)))

const logInUserInit = () => {
  return new Promise((resolve, reject) => {
    User.deleteMany({})
      .then(() => {
        User.register(
          new User({
            username: loginUser.username,
            role: loginUser.role
          }),
          loginUser.passwd
        )
          .then(
            doc => {
              if (doc) {
                info(`user init complete`)
                resolve(0)
              } else {
                throw new Error(`user init fail`)
              }
            },
            err => {
              throw new dbException(err)
            }
          )
          .catch(err => {
            throw err
          })
      })
      .catch(err => {
        error(err)
        resolve(-1)
      })
  })
}

const scoreRightInit = () => {
  return new Promise((resolve, reject) => {
    Config.deleteMany({ key: 'SCORE' })
      .then(() => {
        Config.create({
          key: 'SCORE',
          description: 'score right config',
          config: right
        })
          .then(
            doc => {
              if (doc) {
                info(`score right init complete`)
                resolve(0)
              } else {
                throw new Error(`score right init fali`)
              }
            },
            err => {
              throw new dbException(err)
            }
          )
          .catch(err => {
            throw err
          })
      })
      .catch(err => {
        error(err)
        resolve(-1)
      })
  })
}

const ruleInit = () => {
  return new Promise((resolve, reject) => {
    MonitorRule.deleteMany()
      .then(() => {
        let pros = []
        for (let rule of rules) {
          rule.isUpdate = true
          rule.condition = rule.basicCondition
          pros.push(MonitorRule.create(rule))
        }
        Promise.all(pros)
          .then(docs => {
            info(`rules init compelte`)
            resolve(0)
          })
          .catch(err => {
            throw new dbException(err)
          })
      })
      .catch(err => {
        error(err)
        resolve(-1)
      })
  })
}

const listInit = () => {
  return new Promise((resolve, reject) => {
    MonitorList.deleteMany()
      .then(() => {
        let pros = []
        for (let list of lists) {
          list.isUpdate = true
          pros.push(MonitorList.create(list))
        }
        Promise.all(pros)
          .then(docs => {
            info(`list init compelte`)
            resolve(0)
          })
          .catch(err => {
            throw new dbException(err)
          })
      })
      .catch(err => {
        error(err)
        resolve(-1)
      })
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
        let pros = [logInUserInit(), scoreRightInit(), ruleInit(), listInit()]
        Promise.all(pros)
          .then(data => {
            Config.create({
              key: 'ISINIT',
              description: 'database init flage',
              config: true
            })
              .then(doc => {
                info(`database init`)
                resolve()
              })
              .catch(err => {
                throw new dbException(err)
              })
          })
          .catch(err => {
            throw err
          })
      })
      .catch(err => {
        if (err.message == 'exit') {
          info(`database init`)
        } else {
          warn(JSON.stringify(err.stack))
        }
        resolve()
      })
  })
}

module.exports = {
  logInUserInit,
  scoreRightInit,
  ruleInit,
  listInit,
  databaseInit
}
