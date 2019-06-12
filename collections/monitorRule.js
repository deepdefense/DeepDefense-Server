const mongoose = require('mongoose')
const { Schema } = mongoose

const MonitorRule = new Schema(
  {
    rule: { type: String, require: true, default: '', trim: true },
    desc: { type: String, require: true, default: '', trim: true },
    condition: { type: String, require: true, default: '', trim: true },
    basicCondition: { type: String, require: true, default: '', trim: true },
    output: { type: String, require: true, default: '', trim: true },
    priority: { type: String, require: true, default: '', trim: true },
    tags: { type: Array, require: true, default: [] },
    ctnGroups: { type: Array, default: [] },
    monitorList: { type: String, require: true, default: '', trim: true },
    isUpdate: { type: Boolean, require: true, defaul: true }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

module.exports = mongoose.model('MonitorRule', MonitorRule)
