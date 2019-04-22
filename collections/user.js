const mongoose = require('mongoose')
const { Schema } = mongoose
const passportLocalMongoose = require('passport-local-mongoose')

var user = new Schema({
  username: String,
  password: String,
  role: String
})

user.plugin(passportLocalMongoose)

module.exports = mongoose.model('user', user)
