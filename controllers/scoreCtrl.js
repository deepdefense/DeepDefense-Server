const conf = require('../collections/config')
const image = require('../collections/image')
const { resSuc, resErr } = require('../services/util')
const { debug, info, warn, error } = require('../services/logger')
const { dbException } = require('../class/exceptions')

function getScore(req, res) {
  conf
    .findOne({ key: 'SCORE' })
    .then(doc => {
      debug(JSON.stringify(doc))
      return new Promise(function(resolve, reject) {
        info(`DB: complete`)
        if (doc) {
          resolve(doc.config)
        } else {
          reject(new dbException(`No such config info`))
        }
      })
    })
    .then(function(data) {
      info(`getScore: complete`)
      resSuc(res, data)
    })
    .catch(function(err) {
      warn(`getScore: fail`)
      resErr(res, err)
    })
}

function setScore(req, res) {
  conf
    .findOneAndUpdate({ key: 'SCORE' }, { $set: { config: req.body } }, { new: true })
    .then(function(doc) {
      return new Promise(function(resolve, reject) {
        info(`DB: complete`)
        if (doc) {
          resolve(req.body)
        } else {
          reject(new dbException(`No Such config info`))
        }
      })
    })
    /**fresh score */
    .then(function(data) {
      let levels = Object.keys(req.body)
      image
        .find({})
        .then(function(docs) {
          if (docs.length > 0) {
            docs.forEach(function(doc) {
              if (!(doc.high == -1 && doc.medium == -1 && doc.low == -1 && doc.negligible == -1 && doc.unknown == -1)) {
                let score = (sum = 0)
                for (let level of levels) {
                  score += doc[level] * (data[level] / data['low'])
                  sum += doc[level]
                }
                image
                  .findOneAndUpdate(
                    {
                      repository: doc.repository,
                      image: doc.image,
                      tag: doc.tag
                    },
                    {
                      $set: {
                        score: score / 100
                      }
                    }
                  )
                  .then(function(data) {
                    if (!data) {
                      warn(`No such image`)
                    }
                  })
                  .catch(function(err) {
                    warn(err.stack)
                  })
              }
            })
          }
        })
        .catch(function(err) {
          warn(err.stack)
        })
      return new Promise(function(resolve, reject) {
        resolve(req.body)
      })
    })
    .then(function(data) {
      info(`setScore: complete`)
      resSuc(res, data)
    })
    .catch(function(err) {
      warn(`setScore: fail`)
      resErr(res, err)
    })
}

function addScore(req, res) {
  conf
    .create({ key: 'SCORE', config: req.body })
    .then(function(data) {
      info(`setScore: complete`)
      resSuc(res, data.config)
    })
    .catch(function(err) {
      warn(`setScore: fail`)
      resErr(res, err)
    })
}

module.exports = {
  getScore,
  setScore,
  addScore
}
