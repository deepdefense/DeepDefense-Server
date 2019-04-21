const mongoose = require('mongoose')
const { Schema } = mongoose

var config = new Schema(
    {
        key: { type: String, require: true, tirm: true },
        config: { type: Object, default: {} },
        description: { type: String, default: '', trim: true }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

module.exports = mongoose.model('config', config)
