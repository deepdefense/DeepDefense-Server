'use strict'
/**COLLECTIONS */
const Repository = require('../collections/repository')
const Image = require('../collections/image')
/**LOCAL MODULES */
const repositoryServices = require('../services/repositoryServices')
const scannerApi = require('../services/scannerApi')
const dcrRepositoryApi = require('../services/dcrRepositoryApi')
const { resSuc, resErr } = require('../services/util')
const { debug, info, warn, error } = require('../services/logger')
const { dbException, paramsException, unconnectException } = require('../class/exceptions')

/**
 * @function: get repository list
 */
const getRepositoryList = (req, res) => {
  Repository.find({})
    .select(`-_id, -created_at, -updated_at`)
    .then(docs => {
      info(`getRepositoryList: complete`)
      resSuc(res, docs)
    })
    .catch(err => {
      warn(`getRepositoryList: fail`)
      resErr(res, err)
    })
}

/**
 * @param: {
 *  "repository": "192.168.3.124",
 *  "port": 5000,
 *  "username": null,
 *  "passwd": null,
 *  "isAuth": true,
 *  "isHttps": false,
 *  "name": "测试124"
 * } req.body
 */
const addRepository = (req, res) => {
  let repositoryClone = {}
  /**params check */
  if (!req.body.repository || !isRepositoryLegal(req.body.repository)) {
    resErr(res, new paramsException(`repository illegal`))
    return
  }
  if (!req.body.port || !isPortLegal(req.body.port)) {
    resErr(res, new paramsException(`port illegal`))
    return
  }
  if (req.body.isAuth && !isUsernameLegal(req.body.username) && !isPasswdLegal(req.body.passwd)) {
    resErr(res, new paramsException(`username or passwd illegal`))
    return
  }
  if (!req.body.name) {
    resErr(res, new paramsException(`repository name illegal`))
    return
  }
  /**have existed? */
  Repository.findOne({ repository: req.body.repository, port: req.body.port })
    .then(
      doc => {
        return new Promise((resolve, reject) => {
          if (doc) {
            throw new dbException(`${req.body.repository} already existed, cannot add`)
          } else {
            resolve(req.body)
          }
        })
      },
      err => {
        throw new dbException(err)
      }
    )
    /**test repository connection */
    .then(scannerApi.testRepository)
    .then(isConnect => {
      return new Promise((resolve, reject) => {
        req.body.isConnect = isConnect
        repositoryClone = req.body
        resolve(req.body)
      })
    })
    /**add the repository to the DB */
    .then(data => {
      return new Promise((resolve, reject) => {
        Repository.create(data)
          .then(
            data => {
              info(`addRepository: complete`)
              if (data.isConnect) {
                resolve(data)
              } else {
                throw new unconnectException(`can't connect to ${data.repository}`)
              }
            },
            err => {
              throw new dbException(err)
            }
          )
          .catch(err => {
            reject(err)
          })
      })
    })
    /**get repository's image list if could connect */
    .then(dcrRepositoryApi.getImageByRepository)
    .then(dcrRepositoryApi.getTagByImage)
    .then(async data => {
      let images = repositoryServices.formatResponse(data)
      for (let image of images) {
        try {
          await repositoryServices.saveImage(image)
        } catch (err) {
          warn(err)
        }
      }
      resSuc(res, data)
      scannerApi.analyzeImage(data).catch(err => {
        warn(err)
      })
    })
    .catch(err => {
      if (err.code == 5002) {
        info(`addRepository: complete`)
        resSuc(res, repositoryClone)
      } else {
        warn(err)
        resErr(res, err)
      }
    })
}

/**
 * req.query: { registry }
 */
const removeRepository = (req, res) => {
  // Repository.findOneAndRemove({ repository: req.query.repository })
  Repository.findOneAndRemove({ repository: req.query.repository, port: req.query.port })
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
    .then(doc => {
      Image.deleteMany({
        repository: `${doc.repository}:${doc.port}`
      })
        .then(data => {
          debug(`remove ${doc.repository}:${doc.port} images: complete`)
        })
        .catch(err => {
          warn(`remove ${doc.repository}:${doc.port} images: faile`)
        })
    })
    .then(function(data) {
      info(`removeRepository: complete`)
      resSuc(res, data)
    })
    .catch(function(error) {
      warn(`removeRepository: fail`)
      resErr(res, error)
    })
}

const setRepository = (req, res) => {
  if (req.body.port <= 0) {
    resErr(res, new paramsException(`port illegal`))
    return
  }
  scannerApi
    .testRepository(req.body)
    .then(data => {
      return new Promise((resolve, reject) => {
        req.body.isConnect = data
        resolve(req.body)
      })
    })
    .then(data => {
      return new Promise((resolve, reject) => {
        Repository.findOneAndUpdate({ repository: req.body.repository, port: req.body.port }, { $set: data }, { upsert: true, new: true })
          .then(doc => {
            info(`DB: complete`)
            if (doc && doc.isConnect) {
              resolve(doc)
            } else if (doc && !doc.isConnect) {
              reject(new Error(`cannot connect`))
            } else {
              reject(new dbException(`No ${data.repository}, cannot set`))
            }
          })
          .catch(err => {
            reject(new dbException(err))
          })
      })
    })
    .then(data => {
      return new Promise((resolve, reject) => {
        info(`setRepository: complete`)
        resSuc(res, data)
        resolve(data)
      })
    })
    .then(dcrRepositoryApi.getImageByRepository)
    .then(dcrRepositoryApi.getTagByImage)
    .then(data => {
      debug(JSON.stringify(data))
      data = data.data
      data.images.forEach(image => {
        image.tags.forEach(tag => {
          let doc = {
            repository: `${data.repository}:${data.port}`,
            image: image.image,
            tag: tag,
            namespace: ``,
            high: -1,
            medium: -1,
            low: -1,
            negligible: -1,
            unknown: -1,
            score: -1
          }
          Image.findOneAndUpdate(
            {
              repository: `${data.repository}:${data.port}`,
              image: image.image,
              tag: tag
            },
            {
              $setOnInsert: doc
            },
            { upsert: true, new: true }
          )
            .then(data => {
              info(`DB: complete`)
            })
            .catch(err => {
              warn(err)
            })
        })
      })
    })
    .catch(err => {
      if (err.message == 'cannot connect') {
        info(`setRepository: complete`)
        resSuc(res, req.body)
      } else {
        warn(`setRepository: fail`)
        resErr(res, err)
      }
    })
}

/**
 * @function: test and update isConnect
 */
const testRepository = (req, res) => {
  Repository.findOne({ repository: req.query.repository })
    .then(
      doc => {
        return new Promise((resolve, reject) => {
          info(`Repository: find`)
          if (doc) {
            tempDoc = doc
            resolve(doc)
          } else {
            throw new dbException(`${req.query.repository}: No such repository`)
          }
        })
      },
      err => {
        throw new dbException(err)
      }
    )
    .then(dcrRepositoryApi.testRepository)
    .then(data => {
      return new Promise((resolve, reject) => {
        Repository.findOneAndUpdate({ repository: req.query.repository }, { $set: { isConnect: data } }, { new: true })
          .select({
            _id: 0,
            updated_at: 0,
            created_at: 0
          })
          .then(doc => {
            resolve(doc)
          })
          .catch(err => {
            reject(new dbException(err))
          })
      })
    })
    .then(data => {
      info(`testRepository: complete`)
      resSuc(res, data)
    })
    .catch(err => {
      warn(`testRepository: fail`)
      resErr(res, err)
    })
}

/** LOCAL FUNCTION */
const isRepositoryLegal = ip => {
  return /(2(5[0-5]{1}|[0-4]\d{1})|[0-1]?\d{1,2})(\.(2(5[0-5]{1}|[0-4]\d{1})|[0-1]?\d{1,2})){3}/.test(ip)
}

const isPortLegal = port => {
  return port > 0
}

const isPasswdLegal = passwd => {
  return true
}

const isUsernameLegal = username => {
  return true
}

module.exports = {
  testRepository,
  getRepositoryList,
  addRepository,
  setRepository,
  removeRepository
}
