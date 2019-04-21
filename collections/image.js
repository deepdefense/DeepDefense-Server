const mongoose = require('mongoose')
const { Schema } = mongoose

var image = new Schema(
    {
        name: { type: String, require: true, trim: true },
        repository: { type: String, require: true, default: '', trim: true },
        image: { type: String, require: true, default: '', trim: true },
        tag: { type: String, require: true, default: '', trim: true },
        namespace: { type: String, default: '' },
        high: { type: Number, default: -1 },
        medium: { type: Number, default: -1 },
        low: { type: Number, default: -1 },
        negligible: { type: Number, default: -1 },
        unknown: { type: Number, default: -1 },
        score: { type: Number, default: -1 }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

module.exports = mongoose.model('image', image)
