'use strict'
/**EXPORT MODULES */
const yaml = require('yaml')
const fs = require('fs')
let { binaryOptions, boolOptions, nullOptions, strOptions } = require('yaml/types')
const { Pair, YAMLMap, YAMLSeq } = require('yaml/types')
/**COLLECTIONS */
const MonitorRule = require('../collections/monitorList')
const MonitorList = require('../collections/monitorRule')
/**LOCAL MODUELS */
const util = require('./util')
const { debug, info, warn, error } = require('./logger')
const { fileException, commandException } = require('../class/exceptions')

strOptions.fold.lineWidth = 0

/**GLOBAL VAL*/
let readBuf = yaml.parse(fs.readFileSync(util.getMonitorRulePath(), 'utf8'))
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

const changeToString = docs => {
  docs.forEach(doc => {
    if (doc.hasOwnProperty('items')) {
      let tempStr = '['
      for (let index = 0; index < doc.items.length; index++) {
        if (index == doc.items.length - 1) {
          tempStr = tempStr + `${doc.items[index]}]`
        } else {
          tempStr = tempStr + `${doc.items[index]},`
        }
      }
      doc.items = tempStr
    }
    // if (doc.hasOwnProperty('tags')) {
    //   let tempStr = '['
    //   for (let index = 0; index < doc.tags.length; index++) {
    //     if (index == doc.tags.length - 1) {
    //       tempStr = tempStr + doc.tags[index] + ']'
    //     } else {
    //       tempStr = tempStr + doc.tags[index] + ','
    //     }
    //   }
    //   doc.tags = tempStr
    // }
  })
  return docs
}

/**
 * @function: update deepdefense-monitor-rule.yaml
 * @param: [ updateRules, updateLists, updateCtnGroup ]
 */
const updateConf = data => {
  return new Promise((resolve, reject) => {
    data[0].forEach(updateRule => {
      if (rules.length == 0) {
        rules.push({
          rule: updateRule.rule,
          desc: updateRule.desc,
          condition: updateRule.condition,
          output: updateRule.output,
          priority: updateRule.priority
          // tags: updateRule.tags
        })
        return
      }
      for (let index = 0; index < rules.length; index++) {
        if (rules[index].rule === updateRule.rule) {
          rules[index].condition = updateRule.condition
          break
        }
        if (rules[index].rule !== updateRule.rule && index === rules.length - 1) {
          rules.push({
            rule: updateRule.rule,
            desc: updateRule.desc,
            condition: updateRule.condition,
            output: updateRule.output,
            priority: updateRule.priority
            // tags: updateRule.tags
          })
          break
        }
      }
    })
    data[1].forEach(updateList => {
      if (lists.length == 0) {
        lists.push({
          list: updateList.list,
          items: updateList.items,
          rulename: updateList.rulename
        })
        return
      }
      for (let index = 0; index < lists.length; index++) {
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
      if (lists.length == 0) {
        lists.push({
          list: updateCtnGroup.groupname,
          items: updateCtnGroup.members
        })
        return
      }
      for (let index = 0; index < lists.length; index++) {
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
      fs.writeFileSync(util.getMonitorRulePath(), yaml.stringify(changeToString(writeBuf)), 'utf8')
      util.exec(`sed -i -e 's/"\\[/[/' -i -e 's/]\\"/]/' \`grep 'items' -rl ${util.getMonitorRulePath()} \``).then(data => {
        return new Promise((resolve, reject) => {
          let { stdout, stderr, err } = data
          if (err || stderr) {
            warn(err || stderr)
            throw new commandException(err || stderr)
            return
          }
          if (stdout == '') {
            info(`update monitor rule file: compelte`)
            resolve(`enable rules complete`)
          }
        })
      })
    } catch (err) {
      reject(new fileException(err))
    }
  })
}

module.exports = {
  readBuf,
  updateConf,
  rules,
  lists
}
