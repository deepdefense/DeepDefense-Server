const mongoose = require('mongoose')
const { Schema } = mongoose
const passportLocalMongoose = require('passport-local-mongoose') //  passprot-mongodb middleware

var User = new Schema(
  {
    username: { type: String },
    password: { type: String },
    name: { type: String },
    role: { type: String }
  },
  {
    timestamp: {
      createAt: 'create_at',
      updateAt: 'update_at'
    } //  add timestamp as the attribute name like defined
  }
) //  option

User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User)
