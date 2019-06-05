const mongoose = require('mongoose')
const { Schema } = mongoose

const MonitorRule = new Schema(
  {
    rule: { type: String, require: true, default: '', trim: true },
    desc: { type: String, require: true, default: '', trim: true },
    condition: { type: String, require: true, default: '', trim: true },
    output: { type: String, require: true, default: '', trim: true },
    priority: { type: String, require: true, default: '', trim: true },
    tags: { type: Array, require: true, default: [] }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

module.exports = mongoose.module('MonitorRule', MonitorRule)
