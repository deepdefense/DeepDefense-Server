const repository = require('../collections/repository')
const dockerImage = require('../collections/image')
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
  if (req.body.port && req.body.port <= 0) {
    resErr(res, new paramsException(`port illegal`))
    return
  }
  let repositoryClone = new Object()
  repository
    .findOne({ repository: req.body.repository })
    .then(doc => {
      return new Promise((resolve, reject) => {
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
    })
    .then(dockerRepository.testRepository)
    .then(data => {
      return new Promise(function(resolve, reject) {
        repositoryClone = JSON.parse(JSON.stringify(req.body))
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
        // debug(JSON.stringify(repositoryClone))
        repository
          .create(repositoryClone)
          .then(function(data) {
            info(`DB: compelete`)
            if (repositoryClone.isConnect) {
              resolve(repositoryClone)
            } else {
              reject(new Error(`cannot connect`))
            }
          })
          .catch(err => {
            reject(new dbException(err))
          })
      })
    })
    .then(data => {
      return new Promise((resolve, reject) => {
        info(`addRepository: complete`)
        resSuc(res, data)
        if (data.isConnect) {
          debug(JSON.stringify(data))
          resolve(data)
        } else {
          reject(new Error(`cannot connect`))
        }
      })
    })
    .then(dockerRepository.getImageByRepository)
    .then(dockerRepository.getTagByImage)
    .then(data => {
      return new Promise((resolve, reject) => {
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
                { upsert: true }
              )
              .then(() => {
                info(`DB: complete`)
                resolve({ data, errors: [] })
              })
              .catch(err => {
                warn(err)
              })
          })
        })
      })
    })
    .then(dockerRepository.analyzeImage)
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
  dockerRepository
    .testRepository(req.body)
    .then(data => {
      return new Promise((resolve, reject) => {
        req.body.isConnect = data
        resolve(req.body)
      })
    })
    .then(data => {
      return new Promise((resolve, reject) => {
        repository
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

module.exports = {
  testRepository,
  getRepositoryList,
  addRepository,
  setRepository,
  removeRepository
}
