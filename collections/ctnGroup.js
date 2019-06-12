const mongoose = require('mongoose')
const { Schema } = mongoose

var CtnGroup = new Schema(
  {
    members: { type: Array, require: true, default: [] },
    groupname: { type: String, require: true, default: '', trim: true },
    isUpdate: { type: Boolean, require: true, defaul: true }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

module.exports = mongoose.model('CtnGroup', CtnGroup)
