'use strict'
/**EXPORT MODULES */
const yaml = require('yaml')
const fs = require('fs')
/**COLLECTIONS */
const MonitorRule = require('../collections/monitorList')
const MonitorList = require('../collections/monitorRule')
/**LOCAL MODUELS */
const util = require('./util')
const { debug, info, warn, error } = require('./logger')
const { fileException } = require('../class/exceptions')

/**GLOBAL VAL*/
let readBuf = yaml.parse(fs.readFileSync(util.getMonitorRulePath(), 'utf8'))
let [rules, lists] = [
  readBuf.filter(item => {
    return item.hasOwnProperty('rule')
  }),
  readBuf.filter(item => {
    return item.hasOwnProperty('list')
  })
]

/**
 * @function: update deepdefense-monitor-rule.yaml
 * @param: [ updateRules, updateLists, updateCtnGroup ]
 */
const updateConf = data => {
  return new Promise((resolve, reject) => {
    data[0].forEach(updateRule => {
      for (let index in rules) {
        if (rules[index].rule === updateRule.rule) {
          rules[index].condition = updateRule.condition
        }
      }
    })
    data[1].forEach(updateList => {
      for (let index in lists) {
        if (lists[index].list === updateList.list) {
          lists[index].items = updateList.items
          break
        }
        if (lists[index].list !== updateList.list && index === lists.length - 1) {
          lists.push({
            list: updateList.list,
            items: updateList.items,
            rulename: updateList.rulename
          })
          break
        }
      }
    })
    data[2].forEach(updateCtnGroup => {
      for (let index in lists) {
        if (lists[index].list === updateCtnGroup.groupname) {
          lists[index].items = updateCtnGroup.members
          break
        }
        if (lists[index].list !== updateCtnGroup.groupname && index == lists.length - 1) {
          lists.push({
            list: updateCtnGroup.groupname,
            items: updateCtnGroup.members
          })
          break
        }
      }
    })
    let writeBuf = lists.concat(rules)
    try {
      fs.writeFileSync(util.getMonitorRulePath(), yaml.stringify(writeBuf), 'utf8')
      info(`update monitor rule file: compelte`)
      resolve(`enable rules complete`)
    } catch (err) {
      reject(new fileException(err))
    }
  })
}

module.exports = {
  updateConf,
  rules,
  lists
}
