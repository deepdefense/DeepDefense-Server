const conf = require('../collections/config');
const { resSuc, resErr } = require('../services/common');
const { debug, info, warn, error } = require('../services/logger');
const {
    dbException
} = require('../class/exceptions');

function getScore(req, res) {
    conf.findOne({ key: 'SCORE' })
    .then(function (doc) {
        return new Promise(function (resolve, reject) {
            info(`DB: complete`);
            if (doc) { resolve(doc.config); }
            else { reject(new dbException(`No such config info`)); }
        });
    })
    .then(function (data) {
        info(`getScore: complete`);
        resSuc(res, data);
    })
    .catch(function (err) {
        warn(`getScore: fail`);
        resErr(res, err);
    });
}

function setScore(req, res) {
    conf.findOneAndUpdate({ key: 'SCORE' }, { $set: { config: req.body } })
    .then(function (doc) {
        return new Promise(function (resolve, reject) {
            info(`DB: complete`);
            if(doc) { resolve(req.body); }
            else { reject(new dbException(`No Such config info`)); }
        });
    })
    .then(function (data) {
        info(`setScore: complete`);
        resSuc(res, data);
    })
    .catch(function (err) {
        warn(`setScore: fail`);
        resErr(res, err);
    });
}

function addScore(req, res) {
    conf.create({ key: 'SCORE', config: req.body })
    .then(function (data) {
        info(`setScore: complete`);
        resSuc(res, data.config);
    })
    .catch(function (err) {
        warn(`setScore: fail`);
        resErr(res, err);
    })
}

module.exports = {
    getScore,
    setScore,
    addScore
}