/**COLLECTIONS */
const MonitorEvent = require('../collections/monitorEvent')
const MonitorList = require('../collections/monitorList')
const MonitorRule = require('../collections/monitorRule')
const CtnGroup = require('../collections/ctnGroup')
/**LOCAL MODULES */
const monitorServices = require('../services/monitorServices')
const { debug, info, warn, error } = require('../services/logger')
const { resSuc, resErr } = require('../services/util')
const { dbException, paramsException, unconnectException } = require('../class/exceptions')

const getEventPage = (req, res) => {
  Object.keys(req.body.output_fields).forEach(field => {
    let newField = field.replace('.', '_')
    req.body.output_fields[newField] = req.body.output_fields[field]
    delete req.body.output_fields[field]
  })
  MonitorEvent.create(req.body)
    .then(
      doc => {
        info(`get new monitor event`)
        resSuc(res, 0)
      },
      err => {
        throw new dbException(err)
      }
    )
    .catch(err => {
      warn(err)
      resErr(res, -1)
    })
}

/**
 * @function getStats get event count and event list
 * @param {
 *   "output": "09:44:58.944053051: Debug Shell spawned by untrusted binary (user=root shell=sh parent=httpd cmdline=sh -c ls > /dev/null pcmdline=httpd --action spawn_shell --interval 0 --once gparent=event_generator ggparent=<NA> aname[4]=<NA> aname[5]=<NA> aname[6]=<NA> aname[7]=<NA>)",
 *   "priority": "Debug",
 *   "rule": "Run shell untrusted",
 *   "time": "2019-05-24T09:44:58.944053051Z",
 *   "output_fields": {
 *      "evt.time": 1558691098944053000,
 *      "proc.aname[2]": "event_generator",
 *      "proc.aname[3]": null,
 *      "proc.aname[4]": null,
 *      "proc.aname[5]": null,
 *      "proc.aname[6]": null,
 *      "proc.aname[7]": null,
 *      "proc.cmdline": "sh -c ls > /dev/null",
 *      "proc.name": "sh",
 *      "proc.pcmdline": "httpd --action spawn_shell --interval 0 --once",
 *      "proc.pname": "httpd",
 *      "user.name": "root"
 *  }
 * } req.body
 */
const getStats = async (req, res) => {
  try {
    /**get monitor event list */
    let queryOption = {}
    /**get time search condition */
    let [timeFrom, timeTo] = [req.body.must[0].from, req.body.must[0].to]
    debug(JSON.stringify(req.body.must[0]))
    if (timeFrom !== '' && timeTo !== '') {
      timeFrom = new Date(timeFrom)
      timeTo = new Date(timeTo)
      queryOption.time = {
        $lt: timeFrom,
        $gt: timeTo
      }
    }
    /**get field search condition */
    let [searchField, searchValue] = [req.body.must[1].field, req.body.must[1].value]
    if (searchValue !== '') {
      searchValue = searchValue.trim().split(' ')
      // fieldSeachOption = searchValue.map(key => {
      //   return { $regex: key }
      // })
      // queryOption[searchField] = { $or: fieldSeachOption }
      queryOption.$or = searchValue.map(key => {
        let result = {}
        result[searchField] = { $regex: key }
        return result
      })
    }
    /**get pagenation condition */
    let { size, from } = req.body.pagination
    /**get sort condition */
    let { field, order } = req.body.sort
    let sortOption = {}
    sortOption[field] = order
    debug(JSON.stringify(queryOption, null, '\t'))
    let hits = await MonitorEvent.find(queryOption)
      .sort(sortOption)
      .skip(from)
      .limit(size)
      .exec()
      .then(docs => {
        return new Promise((resolve, reject) => {
          resolve(
            docs.map(doc => {
              return {
                _source: {
                  output: doc.output,
                  output_fields: doc.output_fields,
                  priority: doc.priority,
                  rule: doc.rule,
                  '@timestamp': doc.time
                }
              }
            })
          )
        })
      })

    /**get count stats */
    let countResults = []
    let total = 0
    let priorities = ['Alert', 'Critical', 'Emergency', 'Error', 'infomational', 'Notice', 'Warning']
    for (let priority of priorities) {
      let doc_count = await MonitorEvent.find({ priority: priority }).countDocuments()
      debug(doc_count)
      total = total + doc_count
      countResults.push({
        key: priority,
        doc_count: doc_count
      })
    }
    info(`get status: complete`)
    // resSuc(res, {
    //   hits: hits,
    //   priority: countResults,
    //   total: total
    // })
    res.json({
      hits: hits,
      priority: countResults,
      total: total
    })
  } catch (err) {
    warn(err)
    resErr(res, err)
  }
}

/**
 * @function getRuleList get rule list
 */
const getRuleList = (req, res) => {
  MonitorRule.find()
    .then(
      docs => {
        let results = docs.map((doc, index) => {
          return {
            _id: doc.monitorList,
            _score: index,
            _source: { rulename: doc.rule },
            ctnGroups: doc.ctnGroups
          }
        })
        info(`get rule list: complete`)
        res.json(results)
      },
      err => {
        throw new dbException(err)
      }
    )
    .catch(err => {
      warn(err)
      resErr(res, err)
    })
}

/**
 * @function: get list by list name
 * @param: {} req
 */
const getListByRule = (req, res) => {
  MonitorList.findOne({
    list: req.params.rulename
  })
    .select({
      rulename: 1,
      items: 1,
      list: 1,
      _id: 0
    })
    .then(
      doc => {
        if (doc) {
          res.json({
            list: doc.list,
            items: doc.items
              ? doc.items.map(item => {
                  return { data: item }
                })
              : []
          })
        } else {
          throw new dbException(`${req.params.rulename}: No such list`)
        }
      },
      err => {
        throw new dbException(err)
      }
    )
}

/**
 * @function setLis set list by list name
 * @param: {} req
 */
const setListByRule = (req, res) => {
  MonitorList.findOneAndUpdate(
    {
      list: req.params.rulename
    },
    {
      $set: {
        items: req.body.items,
        isUpdate: true
      }
    },
    {
      new: true
    }
  )
    .select({
      rulename: 1,
      items: 1,
      list: 1,
      _id: 0
    })
    .then(
      doc => {
        if (doc) {
          isDeploy = false
          info(`set list by rule: complete`)
          res.json(doc)
        } else {
          throw new dbException(`${req.params.list}: No such list`)
        }
      },
      err => {
        throw new dbException(err)
      }
    )
    .catch(err => {
      warn(err)
      resErr(res, err)
    })
}

/**
 * @function setRule set enable container groups for rule
 * @param {*} req
 * @param {*} res
 */
const setRule = (req, res) => {
  MonitorRule.findOne({
    rule: req.body.rule
  })
    .then(
      doc => {
        let condition = ''
        if (doc) {
          return new Promise((resolve, reject) => {
            if (req.body.ctnGroups.length !== 0) {
              for (let i in req.body.ctnGroups) {
                if (i == 0) {
                  condition = `${condition} container.name in (${req.body.ctnGroups[i]})`
                } else {
                  condition = `${condition} or container.name in (${req.body.ctnGroups[i]})`
                }
              }
              condition = `(${condition} ) and ${doc.basicCondition}`
            } else {
              condition = doc.basicCondition
            }
            resolve(condition)
          })
        } else {
          throw new dbException(`${req.body.rule}: No such rule`)
        }
      },
      err => {
        throw new dbException(err)
      }
    )
    .then(data => {
      MonitorRule.findOneAndUpdate(
        {
          rule: req.body.rule
        },
        {
          $set: {
            condition: data,
            ctnGroups: req.body.ctnGroups,
            isUpdate: true
          }
        },
        {
          new: true
        }
      )
        .then(
          doc => {
            if (doc) {
              info(`set rule: complete`)
              res.json({
                _id: doc.monitorList,
                _source: {
                  rulename: doc.rule
                },
                ctnGroups: doc.ctnGroups
              })
            } else {
              throw new dbException(`${req.body.rule}: No such rule`)
            }
          },
          err => {
            throw new dbException(err)
          }
        )
        .catch(err => {
          throw err
        })
    })
    .catch(err => {
      warn(err)
      resErr(res, err)
    })
}

/**
 * @function enableRules enable all change
 * @param {*} req
 * @param {*} res
 */
const enableRules = (req, res) => {
  let pros = [MonitorRule.find({ isUpdate: true }), MonitorList.find({ isUpdate: true }), CtnGroup.find({ isUpdate: true })]
  Promise.all(pros)
    .then(monitorServices.updateConf)
    .then(data => {
      return new Promise((resolve, reject) => {
        MonitorRule.updateMany(
          {
            isUpdate: true
          },
          {
            $set: {
              isUpdate: false
            }
          },
          {
            new: true
          }
        )
          .then(docs => {
            resolve(data)
          })
          .catch(err => {
            reject(new dbException(err))
          })
      })
    })
    .then(data => {
      return new Promise((resolve, reject) => {
        MonitorList.updateMany(
          {
            isUpdate: true
          },
          {
            $set: {
              isUpdate: false
            }
          },
          {
            new: true
          }
        )
          .then(docs => {
            resolve(data)
          })
          .catch(err => {
            reject(new dbException(err))
          })
      })
    })
    .then(data => {
      return new Promise((resolve, reject) => {
        CtnGroup.updateMany(
          {
            isUpdate: true
          },
          {
            $set: {
              isUpdate: false
            }
          },
          {
            new: true
          }
        )
          .then(docs => {
            resolve(data)
          })
          .catch(err => {
            reject(new dbException(err))
          })
      })
    })
    .then(data => {
      info(`enable rules: complete`)
      res.json(data)
    })
    .catch(err => {
      warn(err)
      resErr(res, err)
    })
}

module.exports = {
  getEventPage,
  getStats,
  getListByRule,
  setListByRule,
  getRuleList,
  setRule,
  enableRules
}
