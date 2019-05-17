const yaml = require('yaml')
const path = require('path')
const fs = require('fs')
const { debug, info, warn, error } = require('./logger')
const common = require('./common')

var buf = yaml.parse(fs.readFileSync(common.getMonitorConfPath(), 'utf8'))

debug(JSON.stringify(buf))

// yaml.stringify(stack)