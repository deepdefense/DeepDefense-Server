const router = require('express').Router()
const passport = require('passport')
// collections
const User = require('../collections/user')
// util services
const logger = require('../services/logger')
const { resSuc, resErr } = require('../services/util')
// exceptions
const { dbException, paramsException } = require('../class/exceptions')

const isAuthenticate = (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then(
      user => {
        // logger.debug(JSON.stringify(user))
        if (user !== null) {
          return user.authenticate(req.body.password)
        } else {
          throw new paramsException('no such user')
        }
      },
      error => {
        throw new dbException(error.message)
      }
    )
    .then(data => {
      // logger.debug(JSON.stringify(data))
      if (data.user !== false && data.user.username === req.body.username) {
        next()
      } else {
        throw new paramsException('Auth fail')
      }
    })
    .catch(error => {
      resErr(res, error)
    })
}

/**
 * 登陆认证
 */
// router.post('/login', isAuthenticate, passport.authenticate('local'), (req, res) => {
//   resSuc(res, {
//     data: { username: req.body.username },
//     message: 'login success'
//   })
// })
router.post('/login', (req, res) => {
  if (req.body.username == 'admin' && req.body.password == 'admin123') {
    resSuc(res, {
      username: req.body.username
    })
  }
})

/**
 * 登出
 */
router.put('/logout', (req, res) => {})

/**
 * 注册用户
 */
router.post('/sysUser', (req, res) => {
  User.register(new User({ username: req.body.username }), req.body.password, (err, data) => {
    if (err) {
      resErr(res, new paramsException(err.message))
    } else {
      console.log(JSON.stringify(data))
      User.findOneAndUpdate(
        {
          username: data.username
        },
        {
          $set: {
            passwd: req.body.password,
            salt: data.salt,
            hash: data.hash
          }
        },
        {
          new: true,
          overwrite: true
        },
        (err, data) => {
          resSuc(res, data)
        }
      )
    }
  })
})
/**
 * 修改用户密码
 */
router.put('/sysUser/:username', (req, res) => {})

/**
 * 删除用户
 */
router.delete('/sysUser', (req, res) => {
  User.deleteOne({ username: req.query.username })
    .then(data => {
      resSuc(res, {
        data: { username: req.query.username },
        message: 'remove success'
      })
    })
    .catch(error => {
      resErr(res, new dbException(error.message))
    })
})

module.exports = router
