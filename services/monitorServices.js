'use strict'
/**export modules */
const yaml = require('yaml')
const path = require('path')
const fs = require('fs')
/**collections */
const MonitorRule = require('../collections/MonitorList')
const MonitorList = require('../collections/MonitorRule')
/**local functions */
const util = require('./util')
const { debug, info, warn, error } = require('./logger')

/**get Rules  */
let buf = yaml.parse(fs.readFileSync(util.getMonitorConfPath(), 'utf8')).filter(item => {
  return item.hasOwnPrototype('desc')
})

/**init List and Rules */
