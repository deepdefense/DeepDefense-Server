const mongoose = require('mogoose')
const { Schema } = mongoose

var MonitorList = new Schema(
  {
    rulename: { type: String, require: true, default: 'Default_rule', trim: true },
    items: { type: Array, require: true, default: [] },
    list: { type: String, require: true, default: 'Default_list', trim: true },
    isEnable: { type: Boolean, require: true, default: true }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

module.exports = mongoose.model('MonitorList', MonitorList)
