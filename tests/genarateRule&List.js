const yaml = require('yaml')
const fs = require('fs')
const path = require('path')
const { debug } = require('../services/logger')
const MonitorRule = require('../collections/monitorList')
const MonitorList = require('../collections/monitorRule')

let readBuf = yaml.parse(fs.readFileSync(path.join(__dirname, '../config/deepdefense-monitor-rules.yaml'), 'utf8'))

debug(JSON.stringify(readBuf, null, '\t'))

let [rules, lists] = [
  readBuf
    ? readBuf.filter(item => {
        return item.hasOwnProperty('rule')
      })
    : [],
  readBuf
    ? readBuf.filter(item => {
        return item.hasOwnProperty('list')
      })
    : []
]

MonitorList.create()
