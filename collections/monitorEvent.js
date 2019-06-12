/**EXPORT MODULES */
const mongoose = require('mongoose')
const { Schema } = mongoose

const MonitorEvent = new Schema(
  {},
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

module.exports = mongoose.model('MonitorEvent', MonitorEvent)
