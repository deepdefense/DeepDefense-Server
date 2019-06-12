'use strict'
/**COLLECTIONS */
const Repository = require('../collections/repository')
const Image = require('../collections/image')
const Vulnerability = require('../collections/vulnerability')
const Conf = require('../collections/config')
/**LOCAL MODULES */
const io = require('./socketServices')
const { debug, info, warn, error } = require('./logger')
const { dbException, clairException, paramsException } = require('../class/exceptions')

/**
 * @param: data: {
 *   repository: '192.168.3.124',
 *   port: 5000,
 *   isAuth: false,
 *   isHttps: false,
 *   username: 'abc',
 *   passwd: 'abc123',
 *   images: [{
 *     image: 'ubuntu',
 *     tags: ['16.04', ...]
 *   }, {...}, ...]
 *}
 *
 * @return: [
 *   {}, {...}, ...
 * ]
 */
const formatResponse = data => {
  let results = []
  data.images.forEach(image => {
    image.tags.forEach(tag => {
      results.push({
        repository: `${data.repository}${data.port ? `:${data.port}` : ''}`,
        image: image.image,
        tag: tag,
        namespace: '',
        high: -1,
        medium: -1,
        low: -1,
        negligible: -1,
        unknown: -1,
        score: -1
      })
    })
  })
  return results
}

/**
 * @param: data: {
 *   repository: '192.168.3.124',
 *   port: 5000,
 *   isAuth: false,
 *   isHttps: false,
 *   username: 'abc',
 *   passwd: 'abc123',
 *   images: [{
 *     image: 'ubuntu',
 *     tags: ['16.04', ...]
 *   }, {...}, ...]
 *}
 */
const removeImages = data => {
  return new Promise((resolve, reject) => {
    Image.deleteMany({
      repository: `${data.repository}${data.port ? `:${data.port}` : ''}`
    })
      .then(res => {
        if (res.ok == 1) {
          info(`remove images of ${data.repository}${data.port ? `:${data.port}` : ''}: complete, count: ${res.deletedCount}`)
          resolve(data)
        } else {
          throw new dbException(`something wrong happend`)
        }
      })
      .catch(err => {
        reject(new dbException(err))
      })
  })
}

/**
 * @param: {
 *   repository: '192.168.3.124:5000',
 *   image: 'ubuntu',
 *   tag: '16.04',
 *   isEnable: tru,
 *   namespace: 'ubuntu:16.04',
 *   high: 12,
 *   medium: 24,
 *   low: 100,
 *   negligible: 0,
 *   unknown: 1,
 *   score: 24.001
 * } data
 */
const saveImage = data => {
  return new Promise((resolve, reject) => {
    Image.findOneAndUpdate(
      {
        repository: data.repository,
        image: data.image,
        tag: data.tag
      },
      {
        $set: data
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    )
      .then(
        doc => {
          debug(doc.isEnable)
          if (doc.score !== -1) {
            debug(`${doc.repository}/${doc.image}:${doc.tag}: ioSocket`)
            io.emit('news', `${doc.repository}/${doc.image}:${doc.tag}`)
          } else {
            debug(`${doc.repository}/${doc.image}:${doc.tag}: init save`)
          }
          resolve(doc)
        },
        err => {
          throw new dbException(err)
        }
      )
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * @param: data: {
 *   repository: '192.168.3.124:5000',
 *   image: 'ubuntu',
 *   tag: '1604',
 *   namespace: 'ubuntu:16.04',
 *   high: 10,
 *   medium: 24,
 *   low: 100,
 *   negligible: 0,
 *   unknown: 1,
 *   score: 24.001
 * }
 */
const removeVulnerabilities = data => {
  return new Promise((resolve, reject) => {
    Vulnerability.deleteMany(
      {
        repository: data.repository,
        image: data.image,
        tag: data.tag
      },
      err => {
        new dbException(err)
      }
    )
      .then(res => {
        if (res.ok == 1) {
          info(`remove vulnerabilities of ${data.repository}/${data.image}:${data.tag}: complete, count: ${res.deletedCount}`)
          resolve(data)
        } else {
          throw new Error(`something wrong happen`)
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * @param: data: {
 *   result: {
 *     repository: '192.168.3.124:5000',
 *     image: 'ubuntu',
 *     tag: '1604',
 *     namespace: 'ubuntu:16.04',
 *     high: 10,
 *     medium: 24,
 *     low: 100,
 *     negligible: 0,
 *     unknown: 1,
 *     score: 24.001
 *   },
 *   vulnerabilities: [{
 *       ...
 *     }, {...}
 *   ]
 * }
 */
const saveVulnerabilities = data => {
  let { result, vulnerabilities } = data
  return new Promise((resolve, reject) => {
    vulnerabilities.forEach(vul => {
      Vulnerability.create({
        repository: result.repository,
        image: result.image,
        tag: result.tag,
        cveId: vul.Name,
        description: vul.Description,
        link: vul.Link,
        level: vul.Severity,
        type: vul.VulName,
        versionFormat: vul.VersionFormat,
        version: vul.Version
      })
        .then(doc => {
          // debug(`${result.repository}/${result.image}:${result.tag}: ${vul.Name} save complete`)
        })
        .catch(err => {
          warn(`${result.repositories}/${result.image}:${result.tag}: ${vul.Name} save fail`)
        })
    })
  })
}

/**
 * @param: data: {
 *   high: 10,
 *   medium: 24,
 *   low: 100,
 *   neriable: 0,
 *   unknow: 3
 * }
 *
 * @return: 24.001<number>
 */
const calScore = data => {
  let [sum, score] = [0, 0]
  return new Promise(function(resolve, reject) {
    Conf.findOne({ key: 'SCORE' })
      .then(doc => {
        if (doc) {
          const levels = Object.keys(doc.config)
          for (const level of levels) {
            score += data[level] * (doc.config[level] / doc.config['low'])
            sum += data[level]
          }
          info('calScore: complete')
          resolve(score / 100)
        } else {
          throw new dbException('No such config info')
        }
      })
      .catch(err => {
        warn('calScore: fail')
        reject(err)
      })
  })
}

const freshRepository = () => {
  Repository.find({})
    .then(
      docs => {
        docs.forEach(doc => {
          getImageByRepository(doc)
            .then(getTagByImage)
            .then(removeImages)
            .then(data => {
              return new Promise(async (resolve, reject) => {
                for (let image of formatResponse(data)) {
                  try {
                    await saveImage(image)
                  } catch (err) {
                    warn(err)
                  }
                }
                resolve(data)
              })
            })
            .then(analyzeImage)
            .catch(err => {
              warn(err)
            })
        })
      },
      err => {
        throw new dbException(err)
      }
    )
    .catch(err => {
      warn(err)
    })
}

const freshImage = () => {
  Image.find({ score: -1, isEnable: true }).then(docs => {
    docs.forEach(doc => {
      Repository.findOne({
        repository: doc.repository.split(':')[0]
      })
        .then(repoDoc => {
          return new Promise((resolve, reject) => {
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
        .then(clairAnalyze)
        .then(analyzeResult => {
          saveImage([analyzeResult.result]).catch(err => {
            warn(err.stack)
          })
          removeVulnerabilities({ data: analyzeResult })
            .then(saveVulnerabilities)
            .catch(err => {
              warn(err.stack)
            })
        })
        .catch(err => {
          warn(err)
        })
    })
  })
}

module.exports = {
  calScore,
  formatResponse,
  removeImages,
  removeVulnerabilities,
  saveImage,
  saveVulnerabilities,
  freshRepository,
  freshImage
}
