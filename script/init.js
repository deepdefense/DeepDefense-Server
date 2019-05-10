const config = require('../services/config')
const user = require('../collections/user')
const conf = require('../collections/config')
const express = require('../services/express')
const { debug, info, error, warn } = require('../services/logger')

express.connectToMongodb()

user
  .deleteMany({})
  .then(() => {
    return new Promise((resolve, reject) => {
      user
        .register(
          {
            username: 'admin',
            role: 'admin'
          },
          'admin123'
        )
        .then(data => {
          if (data) {
            info(`user init`)
          } else {
            throw new Error(`user init fail`)
          }
        })
        .catch(err => {
          error(err)
        })
    })
  })
  .catch(err => {
    error(err)
  })

conf
  .deleteMany({ key: 'TIMEDSCAN' })
  .then(() => {
    return new Promise((resolve, reject) => {
      conf
        .create({
          key: 'TIMEDSCAN',
          description: 'the analyze timing config',
          config: {
            lastScan: parseInt(new Date().getTime()),
            interval: 1000 * 60 * 60 * 24
          }
        })
        .then(doc => {
          resolve(doc)
        })
        .catch(err => {
          reject(err)
        })
    })
  })
  .then(data => {
    info(`timed scanner init`)
  })
  .catch(err => {
    error(err)
  })

conf
  .deleteMany({ key: 'SCORE' })
  .then(() => {
    return new Promise((resolve, reject) => {
      conf
        .create({
          key: 'SCORE',
          description: 'score right config',
          config: {
            high: 8,
            medium: 4,
            low: 1,
            negligible: 0.2,
            unknown: 0.1
          }
        })
        .then(doc => {
          resolve(doc)
        })
        .catch(err => {
          reject(err)
        })
    })
  })
  .then(data => {
    info(`score right init`)
  })
  .catch(err => {
    error(err)
  })
