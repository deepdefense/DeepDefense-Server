const dockerImage = require('../collections/image')
const dockerVulnerability = require('../collections/vulnerability')
const { debug, info, warn, error } = require('../services/logger')
const { resSuc, resErr } = require('../services/common')
const { dbException, paramsException } = require('../class/exceptions')

/**
 * req.body: { repository, pagination, sort, search }
 * pagination: { from, size }
 * sort: { field, order }
 */
function getPage(req, res) {
  let { size, from } = req.body.pagination
  let { field, order } = req.body.sort
  let and =
    req.body.search && req.body.search.length !== 0
      ? req.body.search.map(function(key) {
          return { $or: [{ image: { $regex: key } }, { tag: { $regex: key } }] }
        })
      : null
  let sortOption = {}
  sortOption[field] = order
  dockerImage
    .find(and ? { $and: and, repository: req.body.repository, isEnable: true } : { repository: req.body.repository, isEnable: true })
    .sort(sortOption)
    .skip(from)
    .limit(size)
    .select({
      _id: 0,
      // name: 1,
      high: 1,
      low: 1,
      negligible: 1,
      medium: 1,
      unknown: 1,
      updated_at: 1,
      repository: 1,
      image: 1,
      tag: 1,
      score: 1
    })
    .exec(async function(err, docs) {
      if (err) {
        warn(`getPage: fail`)
        resErr(res, new dbException(err))
        return
      }
      resSuc(res, {
        docs,
        count: await dockerImage.find(and ? { $and: and, repository: req.body.repository, isEnable: true } : { repository: req.body.repository, isEnable: true }).countDocuments()
      })
    })
}

/**
 * req.body: { repository, image, tag }
 */
function getImage(req, res) {
  dockerImage
    .findOne({
      repository: req.body.repository,
      image: req.body.image,
      tag: req.body.tag
    })
    .then(function(doc) {
      if (doc) {
        resSuc(res, doc)
      } else {
        throw new dbException(`No such image`)
      }
    })
    .catch(function(err) {
      warn(`getImage: faild`)
      resErr(res, doc)
    })
}

/**
 * req.body: { pagination, sort, search, repository }
 * pagination: { from, size }
 * sort: { field, order }
 */
function getImagePage(req, res) {
  let { size, from } = req.body.pagination
  let { field, order } = req.body.sort
  let and =
    req.body.search && req.body.search.length !== 0
      ? req.body.search.map(function(key) {
          return { cveId: { $regex: key } }
        })
      : null
  const match = new RegExp()
  let sortOption = {}
  sortOption[field] = order
  console.time('searchDB')
  dockerVulnerability
    .find(
      and
        ? {
            $and: and,
            repository: req.body.repository,
            image: req.body.image,
            tag: req.body.tag
          }
        : {
            repository: req.body.repository,
            image: req.body.image,
            tag: req.body.tag
          }
    )
    .sort(sortOption)
    .skip(from)
    .limit(size)
    .select({
      _id: 0,
      image: 1,
      tag: 1,
      updated_at: 1,
      repository: 1,
      cveId: 1,
      description: 1,
      link: 1,
      level: 1,
      type: 1,
      versionFormat: 1,
      version: 1
    })
    .exec(async function(err, docs) {
      console.timeEnd('searchDB')
      if (err) {
        warn(`getImagePage: fail`)
        resErr(res, new dbException(err))
        return
      }
      resSuc(res, {
        docs,
        count: await dockerVulnerability
          .countDocuments(
            and
              ? {
                  $and: and,
                  repository: req.body.repository,
                  image: req.body.image,
                  tag: req.body.tag
                }
              : {
                  repository: req.body.repository,
                  image: req.body.image,
                  tag: req.body.tag
                }
          )
          .find(
            and
              ? {
                  $and: and,
                  repository: req.body.repository,
                  image: req.body.image,
                  tag: req.body.tag
                }
              : {
                  repository: req.body.repository,
                  image: req.body.image,
                  tag: req.body.tag
                }
          )
          .countDocuments()
      })
    })
}

module.exports = {
  getPage,
  getImage,
  getImagePage
}
