const conf = require('../collections/config');
const { debug, info, warn, error } = require('./logger');
const { dbException } = require('../class/exceptions');

function initTimedScan() {
  return new Promise(function(resolve, reject) {
    conf
      .create({
        key: 'TIMEDSCAN',
        description: 'the analyze timing config',
        config: {
          lastScan: parseInt(new Date().getTime()),
          interval: 1000 * 60 * 60 * 24
        }
      })
      .then(function(data) {
        if (data) {
          info(`initTimedScan: complete`);
          resolve();
        } else {
          throw new dbException(`DB: can't create`);
        }
      })
      .catch(function(err) {
        warn(`initTimedScan: fail`);
        reject(err);
      });
  });
}

function needScan() {
  return new Promise(function(resolve, reject) {
    conf
      .findOne({ key: 'TIMEDSCAN' })
      .then(function(data) {
        resolve(data.config.lastScan + data.config.interval < parseInt(new Date().getTime()));
      })
      .catch(function(err) {
        reject(new dbException(err));
      });
  });
}

function destroyTimedScan() {
  return new Promise(function(resolve, reject) {
    conf
      .deleteMany({
        key: 'TIMEDSCAN'
      })
      .then(function(data) {
        if (data) {
          info(`destroyTimedScan: complete`);
          resolve();
        } else {
          throw new dbException(`DB: can't create`);
        }
      })
      .catch(function(err) {
        warn(`destroyTimedScan: fail`);
        reject(err);
      });
  });
}

module.exports = {
  initTimedScan,
  needScan,
  destroyTimedScan
};
