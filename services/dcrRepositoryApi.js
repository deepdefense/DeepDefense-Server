/**COLLECTIONS */
const Repository = require('../collections/repository')
const Image = require('../collections/image')
/**LOCAL MODULES */
const util = require('./util')
const { debug, info, warn, error } = require('./logger')
const { dbException, clairException, paramsException } = require('../class/exceptions')

/**
 * @param: data: {
 *   name: '测试124'
 *   repository: '192.168.3.124',
 *   port: 5000,
 *   username: 'abc',
 *   passwd: 'abc123',
 *   isAuth: false,
 *   isHttps: false
 * }
 *
 * @return: false|true
 */
const testRepository = data => {
  return new Promise((resolve, reject) => {
    const dcrApiCheck = {
      url: `${data.isHttps ? 'https' : 'http'}://${data.repository}${data.port ? `:${data.port}` : ''}/v2`,
      username: data.isAuth && data.username !== '' ? data.username : null,
      passwd: data.isAuth && data.passwd !== '' ? data.passwd : null
    }
    // debug(`request:${JSON.stringify(dcrApiCheck)}`)
    util
      .get(dcrApiCheck)
      .then(data => {
        info('testRepository: complete')
        resolve(true)
      })
      .catch(function(err) {
        info('testRepository: complete')
        resolve(false)
      })
  })
}

/**
 * @param: data: {
 *   name: '测试124',
 *   repository: '192.168.3.124',
 *   port: 5000,
 *   username: 'abc',
 *   passwd: 'abc123',
 *   isAuth: false,
 *   isHttps: false
 * }
 *
 * @return: {
 *   name: '测试124',
 *   repository: '192.168.3.124',
 *   port: 5000,
 *   username: 'abc',
 *   passwd: 'abc123',
 *   isAuth: false,
 *   isHttps: false,
 *   images: [
 *     'ubuntu',
 *     'redis'
 *   ]
 * }
 */
const getImageByRepository = data => {
  return new Promise((resolve, reject) => {
    const dcrApi_catalog = {
      url: `${data.isHttps ? 'https' : 'http'}://${data.repository}${data.port ? `:${data.port}` : ''}/v2/_catalog`,
      username: data.isAuth && data.username !== '' ? data.usernmae : null,
      passwd: data.isAuth && data.passwd !== '' ? data.passwd : null
    }
    // debug(`request: ${JSON.stringify(dcrApi_catalog)}`)
    util
      .get(dcrApi_catalog)
      .then(res => {
        info(`getImageByRepository: complete`)
        // debug(JSON.stringify(res))
        data.images = res.repositories
        resolve(data)
      })
      .catch(function(err) {
        warn('getImageByRepository: faild')
        reject(err)
      })
  })
}

/**
 * @param: data: {
 *   name: '测试124',
 *   repository: '192.168.3.124',
 *   port: 5000,
 *   username: 'abc',
 *   passwd: 'abc123',
 *   isAuth: false,
 *   isHttps: false,
 *   images: [
 *     'ubuntu',
 *     'redis'
 *   ]
 * }
 *
 * @return: {
 *   name: '测试124',
 *   repository: '192.168.3.124',
 *    port: 5000,
 *    username: 'abc',
 *    passwd: 'abc123',
 *    isAuth: false,
 *    isHttps: false,
 *    images: [{
 *      image: 'ubuntu',
 *      tags: [ latest ]
 *    }]
 * }
 */
const getTagByImage = data => {
  let results = []
  return new Promise(async (resolve, reject) => {
    if (data.images && data.images.length > 0) {
      for (let i in data.images) {
        let dcrApiTagList = {
          url: `${data.isHttps ? 'https' : 'http'}://${data.repository}:${data.port}/v2/${data.images[i]}/tags/list`,
          username: data.isAuth && data.username !== '' ? data.username : null,
          passwd: data.isAuth && data.passwd !== '' ? data.passwd : null
        }
        debug(`request: ${JSON.stringify(dcrApiTagList)}`)
        try {
          let tags = (await util.get(dcrApiTagList)).tags
          // debug(`tags of ${data.images[i]}: ${JSON.stringify(tags)}`)
          if (tags !== null) {
            results.push({
              image: data.images[i],
              tags: tags
            })
          }
        } catch (err) {
          warn(`tags of ${data.images[i]} err: ${err}`)
        }
      }
      data.images = results
      info('getTagByImage: complete')
      resolve(data)
    } else {
      data.images = results
      info('getTagByImage: complete')
      resolve(data)
    }
  })
}

module.exports = {
  testRepository,
  getImageByRepository,
  getTagByImage
}
