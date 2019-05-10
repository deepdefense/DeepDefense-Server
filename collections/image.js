const mongoose = require('mongoose')
const { Schema } = mongoose

var image = new Schema(
  {
    repository: { type: String, require: true, default: '', trim: true },  //  repository ip:port
    image: { type: String, require: true, default: '', trim: true },  //  image name
    tag: { type: String, require: true, default: '', trim: true },  //  image tag
    namespace: { type: String, default: '' },  //  image namespace(OS)
    high: { type: Number, default: -1 },  //  num of high risk vulnerability
    medium: { type: Number, default: -1 },  //  num of medium risk vulnerability
    low: { type: Number, default: -1 },  //  num of low risk vulnerability
    negligible: { type: Number, default: -1 },  //  num of negligible risk vulnerability
    unknown: { type: Number, default: -1 },  //  num of unknown risk vulnerability
    score: { type: Number, default: -1 },  //  security score
    isEnable: { type: Boolean, default: true }  //  could analyze or not
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

module.exports = mongoose.model('image', image)
