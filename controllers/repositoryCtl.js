const repository = require('../collections/repository')
const dockerRepository = require('../services/dockerRepository')
const { debug, info, warn, error } = require('../services/logger')
const { resSuc, resErr } = require('../services/common')
const { dbException, paramsException } = require('../class/exceptions')

/**
 *
 */
function getRepositoryList(req, res) {
  try {
    repository
      .find({})
      .select(`-_id, -created_at, -updated_at`)
      .exec(function(err, docs) {
        info(`getRepositoryList: complete`)
        resSuc(res, docs)
      })
  } catch (err) {
    warn(`getRepositoryList: fail`)
    resErr(res, err)
  }
}

/**
 * test and update isConnect
 */
function testRepository(req, res) {
  let tempDoc = new Object()
  repository
    .findOne({ repository: req.query.repository })
    .then(function(doc) {
      return new Promise(function(resolve, reject) {
        info(`DB: complete`)
        if (doc) {
          tempDoc = doc
          resolve(doc)
        } else {
          throw new dbException(`${req.query.repository}: No such repository`)
        }
      })
    })
    .then(dockerRepository.testRepository)
    .then(function(data) {
      return new Promise(function(resolve, reject) {
        repository
          .update({ repository: req.query.repository }, { $set: { isConnect: data } })
          .then(function(doc) {
            tempDoc.isConnect = data
            resolve(tempDoc)
          })
          .catch(function(err) {
            reject(new dbException(err))
          })
      })
    })
    .then(function(data) {
      info(`testRepository: complete`)
      resSuc(res, data)
    })
    .catch(function(err) {
      warn(`testRepository: fail`)
      resErr(res, err)
    })
}

/**
 * req.body: { repository, port, username, passwd, isAuth, isHttps }
 */
function addRepository(req, res) {
  if (req.body.port <= 0) {
    resErr(res, new paramsException(`port illegal`))
    return
  }
  repository
    .findOne({ repository: req.body.repository })
    .then(
      function(doc) {
        return new Promise(function(resolve, reject) {
          if (doc) {
            throw new dbException(`${req.body.repository} already existed, cannot add`)
          } else {
            if (!req.body.isHttps) {
              req.body.isHttps = false
            }
            if (!req.body.port) {
              req.body.port = 5000
            }
            resolve(req.body)
          }
        })
      },
      function(err) {
        throw new dbException(err)
      }
    )
    .then(dockerRepository.testRepository)
    .then(function(data) {
      return new Promise(function(resolve, reject) {
        let repositoryClone = JSON.parse(JSON.stringify(req.body))
        if (!repositoryClone.port) {
          delete repositoryClone.port
        }
        if (!repositoryClone.username) {
          delete repositoryClone.username
        }
        if (!repositoryClone.passwd) {
          delete repositoryClone.passwd
        }
        if (!repositoryClone.isHttps) {
          delete repositoryClone.isHttps
        }
        repositoryClone.isConnect = data
        debug(JSON.stringify(repositoryClone))
        repository
          .create(repositoryClone)
          .then(
            function(data) {
              info(`DB: compelete`)
              resolve(data)
            },
            function(err) {
              throw new dbException(err)
            }
          )
          .catch(function(err) {
            reject(err)
          })
      })
    })
    .then(dockerRepository.getImageByRepository)
    .then(dockerRepository.getTagByImage)
    .then(data => {
      // data.
      return new Promise((resolve, reject) => {
        resolve()
      })
    })
    .then(function(data) {
      info(`addRepository: complete`)
      resSuc(res, data)
    })
    .catch(function(err) {
      warn(`addRepository: fail`)
      resErr(res, err)
    })
}

/**
 * req.query: { registry }
 */
function removeRepository(req, res) {
  repository
    .findOneAndRemove({ repository: req.query.repository })
    .then(
      function(doc) {
        return new Promise(function(resolve, reject) {
          info(`DB: complete`)
          if (doc) {
            resolve(doc)
          } else {
            throw new dbException(`No ${req.query.repository}, cannot remove`)
          }
        })
      },
      function(error) {
        throw new dbException(error)
      }
    )
    .then(function(data) {
      info(`removeRepository: complete`)
      resSuc(res, data)
    })
    .catch(function(error) {
      warn(`removeRepository: fail`)
      resErr(res, error)
    })
}

/**
 * req.query: { registry }
 * req.body: { port, username, passwd, isAuth }
 */
function setRepository(req, res) {
  if (req.body.port <= 0) {
    resErr(res, new paramsException(`port illegal`))
    return
  }
  repository
    .findOneAndUpdate({ repository: req.body.repository }, { $set: req.body })
    .then(
      function(doc) {
        return new Promise(function(resolve, reject) {
          info(`DB: complete`)
          if (doc) {
            resolve(doc)
          } else {
            throw new dbException(`No ${req.body.repository}, cannot remove`)
          }
        })
      },
      function(error) {
        throw new dbException(error)
      }
    )
    .then(function(data) {
      info(`setRepository: complete`)
      resSuc(res, data)
    })
    .catch(function(error) {
      warn(`setRepository: fail`)
      resErr(res, error)
    })
}

module.exports = {
  testRepository,
  getRepositoryList,
  addRepository,
  setRepository,
  removeRepository
}
