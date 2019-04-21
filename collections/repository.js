const mongoose = require('mongoose')
const { Schema } = mongoose

var repository = new Schema(
    {
        name: { type: String, require: true, trim: true },
        repository: { type: String, requrie: true, trim: true },
        port: { type: Number, require: true, default: 5000 },
        username: { type: String, default: '', trim: true },
        passwd: { type: String, default: '', trim: true },
        isHttps: { type: Boolean, require: true, default: false },
        isAuth: { type: Boolean, require: true, default: false },
        isConnect: { type: Boolean, require: true, default: false }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

module.exports = mongoose.model('repository', repository)
