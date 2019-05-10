const mongoose = require('mongoose')
const { Schema } = mongoose

var repository = new Schema(
  {
    name: { type: String, require: true, trim: true },  //  nick name
    repository: { type: String, requrie: true, trim: true },  //  repository ip
    port: { type: Number, require: true, default: 5000 },  //  repository port
    username: { type: String, default: '', trim: true },  //  if auth, username
    passwd: { type: String, default: '', trim: true },  //  if auth, passwd
    isHttps: { type: Boolean, require: true, default: false },  //  enable/disable https RESTFULL
    isAuth: { type: Boolean, require: true, default: false },  //  enable/disablt auth
    isConnect: { type: Boolean, require: true, default: false }  //  could connect or not
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

module.exports = mongoose.model('repository', repository)
