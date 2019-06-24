/**EXPORT MODULES */
const mongoose = require('mongoose')
const { Schema } = mongoose
/**LOCAL MODULES */
const { debug, info, warn, error } = require('../services/logger')

const MonitorEvent = new Schema(
  {
    output: { type: String, default: '', requrie: true, trim: true },
    priority: { type: String, default: '', requrie: true, trim: true },
    rule: { type: String, default: '', requrie: true, trim: true },
    time: { type: Date, requrie: true },
    output_fields: { type: Object, default: {} }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

MonitorEvent.index({ time: -1, rule: 1 })

MonitorEvent.on('index', err => {
  info(err)
})

module.exports = mongoose.model('MonitorEvent', MonitorEvent)
