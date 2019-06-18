/**EXPORTES MODULES */
const fs = require('fs')
const path = require('path')
/**COLLECTIONS */
const Backup = require('../collections/backup')
const MonitorEvent = require('../collections/monitorEvent')
/**LOCAL MODUELS */
const util = require('../services/util')
const { resSuc, resErr } = util
const { dbException, fileException, shellException, commandException } = require('../class/exceptions')
const { debug, info, warn, error } = require('../services/logger')

const getBackupList = (req, res) => {
  Backup.find()
    .select({
      _id: 0,
      id: 1,
      start_time: 1,
      end_time: 1,
      status: 1
    })
    .then(
      docs => {
        res.json(docs)
      },
      err => {
        throw new dbException(err)
      }
    )
    .catch(err => {
      resErr(res, err)
    })
}

const createBackup = (req, res) => {
  if (!isLegalId(req.params.id)) {
    resErr(res, {
      message: `id ilegal`
    })
  }
  Backup.findOne({
    id: req.params.id
  })
    .then(
      doc => {
        return new Promise((resolve, reject) => {
          if (doc) {
            throw new dbException(`${req.params.id}: has been exited`)
          } else {
            resolve()
          }
        })
      },
      err => {
        throw new dbException(err)
      }
    )
    .then(() => {
      MonitorEvent.find()
        .select({
          _id: 0,
          output: 1,
          priority: 1,
          rule: 1,
          time: 1,
          output_fields: 1,
          created_at: 1
        })
        .sort({
          time: 'asc'
        })
        .then(docs => {
          return new Promise((resolve, reject) => {
            try {
              fs.writeFileSync(path.join(__dirname, `../backup/${req.params.id}`), JSON.stringify(docs))
              resolve({
                start_time: docs[0].time,
                end_time: docs[docs.length - 1].time
              })
            } catch (err) {
              reject(new fileException(err))
            }
          })
        })
        .then(data => {
          Backup.create({
            id: req.params.id,
            start_time: data.start_time,
            end_time: data.end_time,
            status: 'available'
          })
            .then(
              doc => {
                res.json({
                  accepted: true
                })
                //   resSuc(res, {
                //     accepted: true
                //   })
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
          resErr(res, err)
        })
    })
}

const deleteBackup = (req, res) => {
  Backup.findOne({
    id: req.params.id
  })
    .then(
      doc => {
        return new Promise((resolve, reject) => {
          if (doc) {
            resolve(`rm ${path.join(__dirname, `../backup/${req.params.id}`)}`)
          } else {
            throw new dbException(`${req.params.id}: No such backup`)
          }
        })
      },
      err => {
        throw new dbException(err)
      }
    )
    .then(util.exec)
    .then(data => {
      return new Promise((resolve, reject) => {
        // let { stdout, stderr, err } = data
        // if (stderr && stderr !== '') {
        //   reject(new commandException(stderr))
        // }
        // if (stdout && stdout === '') {
        //   resolve()
        // }
        // if (err && err !== '') {
        //   reject(new shellException(err))
        // }
        resolve()
      })
    })
    .then(() => {
      Backup.findOneAndRemove({
        id: req.params.id
      })
        .then(
          doc => {
            if (doc) {
              res.json({
                acknowledged: true
              })
            } else {
              throw new dbException(err)
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
      resErr(res, err)
    })
}

const recoverBackup = (req, res) => {
  Backup.findOne({
    id: req.params.id
  })
    .then(
      doc => {
        return new Promise((resolve, reject) => {
          if (doc) {
            throw new dbException(`${req.params.id}: No such backup`)
          } else {
            resolve()
          }
        })
      },
      err => {
        throw new dbException(err)
      }
    )
    .then(() => {
      docs = JSON.parse(fs.readFileSync(path.join(__dirname, `../backup/${req.params.id}`)))
      docs.forEach(doc => {
        MonitorEvent.findOneAndUpdate(
          {
            time: doc.time,
            created_at: doc.created_at
          },
          {
            $set: doc
          },
          {
            upsert: true,
            new: true
          }
        )
          .then(doc => {})
          .catch(err => {
            warn(err)
          })
      })
      res.json({
        id: req.params.id
      })
    })
    .catch(err => {
      resErr(res, err)
    })
}

const isLegalId = id => {
  return id !== ''
}

module.exports = {
  getBackupList,
  createBackup,
  deleteBackup,
  recoverBackup
}
