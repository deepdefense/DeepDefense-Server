/**EXPORT MODULES */
const clairClient = require('clair-client')
/**LOCAL MODULES */
const util = require('./util')
const repositoryServices = require('./repositoryServices')
const { debug, info, warn, error } = require('./logger')
const { dbException, clairException, paramsException } = require('../class/exceptions')

/**
 * @param: data: {
 *   name: '测试124',
 *   repository: '192.168.3.124',
 *   port: 5000,
 *   username: 'abc',
 *   passwd: 'abc123',
 *   isAuth: false,
 *   isHttps: false,
 *   image: 'ubuntu',
 *   tags: 'latest'
 * }
 *
 * @return: {
 *   result: {
 *     repository: '192.168.3.124:5000',
 *     image: 'ubuntu',
 *     tag: '1604',
 *     isEnable: true
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
const clairAnalyze = data => {
  let vulnerabilities = new Array()
  let result = {
    repository: `${data.repository}${data.port ? `:${data.port}` : ''}`,
    image: data.image,
    tag: data.tag
  }
  return new Promise((resolve, reject) => {
    let clairOption = {
      clairAddress: util.getScannerUrl(),
      dockerInsecure: !data.isHttps
    }
    if (data.isAuth && data.username !== '' && data.passwd !== '') {
      clairOption.dockerUsername = data.username
      clairOption.dockerPassword = data.passwd
    }
    // debug(JSON.stringify(clairOption))
    const clair = new clairClient(clairOption)
    const image = `${data.isHttps ? 'https' : 'http'}://${data.repository}${data.port ? `:${data.port}` : ''}/${data.image}:${data.tag}`
    // debug(JSON.stringify(image))
    clair
      .analyze({ image })
      .then(async analyzeResult => {
        if (!analyzeResult.isVulnerable) {
          warn(`${image}: can't analyze,you may check the status of deepdefense-scanner`)
          result.isEnable = false
          resolve({
            result,
            vulnerabilities: []
          })
        } else {
          result.namespace = analyzeResult.vulnerabilities[0] && analyzeResult.vulnerabilities[0].NamespaceName ? analyzeResult.vulnerabilities[0].NamespaceName : null
          result.isEnable = true
          let [high, medium, low, negligible, unknown] = [0, 0, 0, 0, 0]
          let levels = {
            high,
            medium,
            low,
            negligible,
            unknown
          }
          for (const vul1 of analyzeResult.vulnerabilities) {
            for (const vul2 of vul1.Vulnerabilities) {
              levels[vul2.Severity.toLowerCase()]++
              vulnerabilities.push(
                Object.assign(vul2, {
                  VulName: vul1.Name,
                  VersionFormat: vul1.VersionFormat,
                  Version: vul1.Version
                })
              )
            }
          }
          result = Object.assign(result, levels)
          result.score = await repositoryServices.calScore(result)
          debug(`${image} analyze: complete`)
          // debug(`result: ${JSON.stringify(result)}`)
          // debug(`vulnerabilities: ${JSON.stringify(vulnerabilities)}`)
          resolve({ vulnerabilities, result })
        }
      })
      .catch(err => {
        warn(`clair error: ${err}`)
        result.isEnable = false
        resolve({
          result: result,
          vulnerabilities: []
        })
      })
  })
}

/**
 * @params data: {
 *   name: '测试124',
 *   repository: '192.168.3.124',
 *   port: 5000,
 *   username: 'abc',
 *   passwd: 'abc123',
 *   isAuth: false,
 *   isHttps: false,
 *   images: [{
 *     image: 'ubuntu',
 *     tags: [ latest ]
 *   }]
 *}
 */
const analyzeImage = data => {
  return new Promise(async (resolve, reject) => {
    for (let image of data.images) {
      for (let tag of image.tags) {
        clairAnalyze({
          repository: data.repository,
          port: data.port,
          username: data.username,
          passwd: data.passwd,
          isHttps: data.isHttps,
          isAuth: data.isAuth,
          image: image.image,
          tag: tag
        })
          .then(data => {
            return new Promise((resolve, reject) => {
              /**remove old image docs of this repository */
              repositoryServices.saveImage(data.result)
              repositoryServices
                .removeVulnerabilities({
                  repository: data.result.repository,
                  image: data.result.image,
                  tag: data.result.tag
                })
                .then(() => {
                  repositoryServices.saveVulnerabilities(data)
                })
                .catch(err => {
                  warn(JSON.stringify(err.stack))
                })
            })
          })
          .catch(err => {
            warn(`${data.repository}${data.port ? `:${data.port}` : ``}/${image.image}:${tag} save fail:　${err}`)
          })
      }
    }
    info(`reposiroty ${data.repository}: analyze complete`)
    resolve(data)
  })
}

module.exports = {
  clairAnalyze,
  analyzeImage
}
