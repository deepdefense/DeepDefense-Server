const Repository = require('../collections/repository')
const dockerImage = require('../collections/image')
const dockerRepository = require('../services/dockerRepository')
const { debug, info, warn, error } = require('../services/logger')
const { resSuc, resErr } = require('../services/common')
const { dbException, paramsException } = require('../class/exceptions')

/** COMMON FUNCTION */

const getRepositoryList = (req, res) => {
  try {
    Repository
      .find({})
      .select(`-_id, -created_at, -updated_at`)
      .exec((err, docs) => {
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
function testRepository (req, res) {
  let tempDoc = new Object()
  Repository
    .findOne({ repository: req.query.repository })
    .then(function (doc) {
      return new Promise(function (resolve, reject) {
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
    .then(function (data) {
      return new Promise(function (resolve, reject) {
        Repository
          .update({ repository: req.query.repository }, { $set: { isConnect: data } })
          .then(function (doc) {
            tempDoc.isConnect = data
            resolve(tempDoc)
          })
          .catch(function (err) {
            reject(new dbException(err))
          })
      })
    })
    .then(function (data) {
      info(`testRepository: complete`)
      resSuc(res, data)
    })
    .catch(function (err) {
      warn(`testRepository: fail`)
      resErr(res, err)
    })
}

/**
 * req.body: {
 *  "repository": "192.168.3.124",
 *  "port": 5000,
 *  "username": null,
 *  "passwd": null,
 *  "isAuth": true,
 *  "isHttps": false,
 *  "name": "测试124"
 * }
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
  Repository
    .findOne({ repository: req.body.repository })
    .then(doc => {
      return new Promise((resolve, reject) => {
        if (doc) {
          throw new dbException(`${req.body.repository} already existed, cannot add`)
        } else {
          resolve(req.body)
        }
      })
    }, (err) => { throw new dbException(err) })
    /**test repository connection */
    .then(dockerRepository.testRepository)
    .then(isConnect => {
      return new Promise(function (resolve, reject) {
        req.body.isConnect = isConnect
        repositoryClone = req.body
        resolve(req.body)
      })
    })
    /**add the repository to the DB */
    .then(data => {
      return new Promise((resolve, reject) => {
        Repository
          .create(data)
          .then(data => {
            info(`addRepository: complete`)
            if (data.isConnect) {
              resolve(data)
            } else {
              reject(new Error(`cannot connect`))
            }
          }, err => { throw new dbException(err) })
          .catch(err => {
            reject(new dbException(err))
          })
      })
    })
    /**get repository's image list if could connect */
    .then(dockerRepository.getImageByRepository)
    .then(dockerRepository.getTagByImage)
    .then(async data => {
      let images = dockerRepository.formatResponse(data)
      for (let image of images) {
        try {
          await dockerRepository.saveImage(image)
        } catch (err) {
          warn(err.stack)
        }
      }
      resSuc(res, data)
      dockerRepository.analyzeImage(data)
        .catch(err => {
          warn(err.stack)
        })
    })
    .catch(err => {
      if (err.message == `cannot connect`) {
        info(`addRepository: complete`)
        resSuc(res, repositoryClone)
      } else if (err.message.indexOf('already existed') > -1) {
        warn(err)
        res.json({
          code: 1,
          data: null,
          message: `${err}`
        })
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
  Repository
    .findOneAndRemove({ repository: req.query.repository })
    .then(
      function (doc) {
        return new Promise(function (resolve, reject) {
          info(`DB: complete`)
          if (doc) {
            resolve(doc)
          } else {
            throw new dbException(`No ${req.query.repository}, cannot remove`)
          }
        })
      },
      function (error) {
        throw new dbException(error)
      }
    )
    .then(doc => {
      dockerImage
        .deleteMany({
          repository: `${doc.repository}:${doc.port}`
        })
        .then(data => {
          debug(`remove ${doc.repository}:${doc.port} images: complete`)
        })
        .catch(err => {
          warn(`remove ${doc.repository}:${doc.port} images: faile`)
        })
    })
    .then(function (data) {
      info(`removeRepository: complete`)
      resSuc(res, data)
    })
    .catch(function (error) {
      warn(`removeRepository: fail`)
      resErr(res, error)
    })
}

const setRepository = (req, res) => {
  if (req.body.port <= 0) {
    resErr(res, new paramsException(`port illegal`))
    return
  }
  dockerRepository
    .testRepository(req.body)
    .then(data => {
      return new Promise((resolve, reject) => {
        req.body.isConnect = data
        ressudoolve(req.body)
      })
    })
    .then(data => {
      return new Promise((resolve, reject) => {
        Repository
          .findOneAndUpdate({ repository: req.body.repository }, { $set: data }, { upsert: true, new: true })
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
    .then(dockerRepository.getImageByRepository)
    .then(dockerRepository.getTagByImage)
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
          dockerImage
            .findOneAndUpdate(
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

/** LOCAL FUNCTION */
const isRepositoryLegal = (ip) => {
  return /(2(5[0-5]{1}|[0-4]\d{1})|[0-1]?\d{1,2})(\.(2(5[0-5]{1}|[0-4]\d{1})|[0-1]?\d{1,2})){3}/.test(ip)
}

const isPortLegal = (port) => {
  return port > 0
}

const isPasswdLegal = (passwd) => {
  return true
}

const isUsernameLegal = (username) => {
  return true
}

module.exports = {
  testRepository,
  getRepositoryList,
  addRepository,
  setRepository,
  removeRepository
}
