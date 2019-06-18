/**COLLECTIONS */
const CtnGroup = require('../collections/ctnGroup')
/**LOCAL MODULES */
const monitorServices = require('../services/monitorServices')
const { resSuc, resErr } = require('../services/util')
const { debug, info, warn, error } = require('../services/logger')
const { dbException } = require('../class/exceptions')

/**
 * @function getCtnGroupList get container group list
 * @param {*} req
 * @param {*} res
 */
const getCtnGroupList = (req, res) => {
  CtnGroup.find()
    .select({
      members: 1,
      groupname: 1,
      _id: 0
    })
    .then(
      docs => {
        info(`getCtnGroupList: complete`)
        // resSuc(res, docs)
        res.json(docs)
      },
      err => {
        throw new dbException(err)
      }
    )
    .catch(err => {
      warn(err)
      warn(`getCtnGroupList: fail`)
      resErr(res, err)
    })
}

/**
 * @function createCtnGroup create container group list
 * @param {*} req
 * @param {*} res
 */
const createCtnGroup = (req, res) => {
  CtnGroup.findOne({
    groupname: req.body.groupname
  })
    .then(
      doc => {
        return new Promise((resolve, reject) => {
          if (doc) {
            throw new dbException(`${doc.groupname} is already in DB`)
          } else {
            resolve(req.body)
          }
        })
      },
      err => {
        throw new dbException(err)
      }
    )
    .then(data => {
      data.isUpdate = true
      CtnGroup.create(data)
        .then(doc => {
          if (doc) {
            info(`createCtnGroup: complete`)
            // resSuc(res, {
            //   members: doc.members,
            //   groupname: doc.groupname
            // })
            res.json({
              members: doc.members,
              groupname: doc.groupname
            })
          } else {
            throw new dbException(`${data.groupname}: save to DB fail`)
          }
        })
        .catch(err => {
          throw err
        })
    })
    .catch(err => {
      warn(err)
      warn(`createCtnGroup: fail`)
      resErr(res, err)
    })
}

/**
 * @function setCtnGroup set member of container group
 * @param {*} req
 * @param {*} res
 */
const setCtnGroup = (req, res) => {
  CtnGroup.findOneAndUpdate(
    {
      groupname: req.body.groupname
    },
    {
      $set: {
        members: req.body.members,
        isUpdate: true
      }
    },
    {
      new: true
    }
  )
    .select({
      members: 1,
      groupname: 1,
      _id: 0
    })
    .then(
      doc => {
        if (doc) {
          info(`setCtnGroup: complete`)
          // resSuc(res, doc)
          res.json(doc)
        } else {
          throw new dbException(`${req.body.groupname}: No such doc in DB`)
        }
      },
      err => {
        throw new dbException(err)
      }
    )
    .catch(err => {
      warn(err)
      warn(`setCtnGroup: fali`)
      reqErr(res, err)
    })
}

/**
 * @function deleteCtnGroup set group preparing to delete
 * @param {*} req
 * @param {*} res
 */
const deleteCtnGroup = (req, res) => {
  CtnGroup.findOneAndDelete({
    groupname: req.params.groupname
  })
    .select({
      members: 1,
      groupname: 1,
      _id: 0
    })
    .then(
      doc => {
        if (doc) {
          for (let index in monitorServices.lists) {
            if (monitorServices.lists[index].list == req.params.groupname) {
              monitorServices.lists.splice(index, 1)
            }
          }
          info(`deleteCtnGroup: complete`)
          // resSuc(res, doc)
          res.json(doc)
        } else {
          throw new dbException(`${req.query.groupname}: No such doc in DB`)
        }
      },
      err => {
        throw new dbException(err)
      }
    )
    .catch(err => {
      warn(err)
      warn(`deleteCtnGroup: fail`)
      resErr(res, err)
    })
}

module.exports = {
  getCtnGroupList,
  createCtnGroup,
  setCtnGroup,
  deleteCtnGroup
}
