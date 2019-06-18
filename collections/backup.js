/**EXPORTS MODULES */
const mongoose = require('mongoose')
const { Schema } = mongoose

const Backup = new Schema(
  {
    id: { type: String, require: true, default: '', trim: true },
    start_time: { type: String, require: true, default: '', trime: true },
    end_time: { type: String, require: true, default: '', trime: true },
    status: { type: String, require: true, default: true }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

module.exports = mongoose.model('Backup', Backup)
