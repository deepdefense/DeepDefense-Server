const mongoose = require('mongoose')
const pg = require('pg')
const { Pool, Client } = pg
const request = require('request')
const zlib = require('zlib')
const path = require('path')
const preExec = require('child_process').exec
const { debug, info, warn, error } = require('./logger')
const config = require('./config')

const getMongoDBUrl = () => {
  return `mongodb://${config.database.ip}:${config.database.port}/deepdefense`
}

const getPgsqlUrl = () => {
  return `postgresql://postgres@${config.cve.ip}:${config.cve.port}/postgres`
}

const getScannerUrl = () => {
  return `http://${config.scanner.ip}:${config.scanner.port}`
}

const getMonitorConfPath = () => {
  // return path.join(__dirname, '../config/falco.yaml')
  return `/etc/deepdefense/deepdefense-monitor-config.yaml`
}

const getMonitorRulePath = () => {
  return `/etc/deepdefense/deepdefense-monitor-rules.yaml`
  // return `/etc/deepdefense/deepdefense-monitor-rules-test.yaml`
}

/**
 * connecte to the mongodb
 */
const connectToMongodb = () => {
  const connect = () => {
    var options = {
      // server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
      // replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
      useNewUrlParser: true,
      useFindAndModify: false // enable use findOneAndUpdate or findOneAndRemove
    }
    return (connct = mongoose.connect(getMongoDBUrl(), options))
  }

  mongoose.connection
    .on('error', err => {
      error(err)
    })
    .on('disconnected', () => {
      connect() // reconnect to the mongodb
    })
    .on('open', () => {
      info(`connect to the ${getMongoDBUrl()}`)
    })
  return connect() // connect to the mongodb
}

/**
 * postgresql connect
 */
const cvePool = new Pool({ connectionString: `${getPgsqlUrl()}` })

cvePool.on('connect', client => {
  info(`get a new connect`)
})

/**data: { url, username, passwd, isAuth } */
const get = data => {
  return new Promise(function(resolve, reject) {
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

    request.get(option, function(err, response, data) {
      // debug(`statusCode: ${response !== null ? response.statusCode : null }`);
      if (!err && response.statusCode === 200) {
        let buffer = new Buffer(data)
        let encoding = response.headers['content-encoding']
        if (encoding == 'gzip') {
          zlib.gunzip(buffer, function(err, decoded) {
            if (err) {
              reject(`unzip error ${err}`)
            }
            if (decoded) {
              resolve(decoded.toStrign())
              return
            }
          })
        } else if (encoding == 'deflate') {
          zlib.inflate(buffer, function(err, decoded) {
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

const resSuc = (res, data) => {
  // debug(`response.data: ${JSON.stringify(data)}`)
  res.statusCode = 200
  res.json({
    code: 0,
    data: data,
    message: `ok`
  })
}

const resErr = (res, error) => {
  // warn(`response.errorStack: ${JSON.stringify(error.stack, null, '\t')}`)
  res.statusCode = 500
  res.json({
    code: error.code,
    data: error.message,
    message: error.name
  })
}

const exec = cmd => {
  return new Promise((resolve, reject) => {
    preExec(cmd, (err, stdout, stderr) => {
      debug(`\n--err--${err}\n--stdout--${stdout}\n--stderr--${stderr}`)
      resolve({ err, stdout, stderr })
    })
  })
}

module.exports = {
  connectToMongodb,
  cvePool,
  resSuc,
  resErr,
  exec,
  get,
  getMongoDBUrl,
  getScannerUrl,
  getPgsqlUrl,
  getMonitorConfPath,
  getMonitorRulePath
}
