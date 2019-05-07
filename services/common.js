const request = require('request')
const zlib = require('zlib')
const { debug, warn } = require('./logger')
const config = require('./config')

/**data: { url, username, passwd, isAuth } */
function get (data) {
  return new Promise(function (resolve, reject) {
    let headers = {
      Accept: 'text/html, application/xhtml+xml, */*',
      'Accept-Language': 'zh-CN',
      'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
      Connection: 'Keep-Alive',
      'Accept-Encoding': 'gzip,deflate'
    }
    let option = {
      url: data.url,
      headers,
      timeout: 10000,
      encoding: null
    }
    if (data.username && data.passwd) {
      option.auth = {
        username: data.username,
        password: data.passwd
      }
    }

    request.get(option, function (err, response, data) {
      // debug(`statusCode: ${response !== null ? response.statusCode : null }`);
      if (!err && response.statusCode === 200) {
        let buffer = new Buffer(data)
        let encoding = response.headers['content-encoding']
        if (encoding == 'gzip') {
          zlib.gunzip(buffer, function (err, decoded) {
            if (err) {
              reject(`unzip error ${err}`)
            }
            if (decoded) {
              resolve(decoded.toStrign())
              return
            }
          })
        } else if (encoding == 'deflate') {
          zlib.inflate(buffer, function (err, decoded) {
            if (err) {
              reject(`deflate error ${err}`)
            }
            if (decoded) {
              resolve(decoded.toString())
              return
            }
          })
        } else {
          resolve(JSON.parse(buffer.toString()))
          return
        }
      } else {
        reject(err)
      }
    })
  })
}

function resSuc (res, data) {
  debug(`response.data: ${JSON.stringify(data)}`)
  res.statusCode = 200
  res.json({
    code: 0,
    data: data,
    message: `ok`
  })
}

function resErr (res, error) {
  warn(`response.errorStack: ${JSON.stringify(error.stack)}`)
  res.statusCode = 500
  res.json({
    code: error.code,
    data: error.message,
    message: error.name
  })
}

const getMongoDBUrl = () => {
  return `mongodb://${config.database.ip}:${config.database.port}/deepdefense`
}

const getScannerUrl = () => {
  return `http://${config.scanner.ip}:${config.scanner.port}`
}

module.exports = {
  resSuc,
  resErr,
  get,
  getMongoDBUrl,
  getScannerUrl
}
