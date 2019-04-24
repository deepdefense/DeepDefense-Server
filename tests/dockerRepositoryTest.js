const dockerRepository = require('../services/dockerRepository')
const conf = require('../collections/config')
const user = require('../collections/user')
const repository = require('../collections/repository')
const { debug, info, warn, error } = require('../services/logger')
const { connectToMongodb } = require('../services/express')
const dockerImage = require('../collections/image')

connectToMongodb()

// dockerRepository.getImageByRepository({ repository: '192.168.10.118' })
// .then(function (data) { info(JSON.stringify(data)); })
// .catch(function (err) { error(JSON.stringify(err)); });

// dockerRepository.getImageByRepository({ repository: '192.168.10.118' })
// .then(function (data) {
//     return new Promise(function (resolve, reject) {
//         dockerRepository.getTagByImage(data)
//         .then(function (data) { resolve(data); })
//         .catch(function (err) { reject(err); });
//     });
// })
// .then(function (data) { info(JSON.stringify(data)); })
// .catch(function (err) { error(JSON.stringify(err)); });

// dockerRepository.saveImageToDB({
//     name:'192.168.10.118:5000/ubuntu:16.04',
//     repository: '192.168.10.118:5000',
//     image: 'ubuntu',
//     tag: '16.04'
// })

// dockerImage.create({
//     name:'192.168.10.118:5000/ubuntu:18.04',
//     repository: '192.168.10.118:5000',
//     image: 'ubuntu',
//     tag: '16.04'
// })

// dockerImage
//   .find({})
//   .then(function(data) {
//     info(JSON.stringify(data))
//   })
//   .catch(function(err) {
//     error(JSON.stringify(err))
//   })

// conf
//   .findOne({ key: 'SCORE' })
//   .then(doc => {
//     info(JSON.stringify(doc))
//   })
//   .catch(err => {
//     err(JSON.stringify(err))
//   })

// repository
//   .find()
//   .then(docs => {
//     info(JSON.stringify(docs))
//   })
//   .catch(err => {
//     err(JSON.stringify(err))
//   })

// dockerRepository.clairAnalyze({
//     repository: '192.168.10.118',
//     port: 5000,
//     username: '',
//     passwd: '',
//     isHttps: false,
//     isAuth: false,
//     image: 'ubuntu',
//     tag: '16.04'
// })
// .then(function (data) { info(JSON.stringify(data)); })
// .catch(function (err) { error(JSON.stringify(err.stack)); });

// dockerRepository.calScore({
//     high: 5,
//     medium: 7,
//     low: 20,
//     negligible: 16,
//     unknown: 0
// })
// .then(function (data) { info(JSON.stringify(data)); })
// .catch(function (err) { error(JSON.stringify(err.stack)); });

// dockerRepository
//   .getImageByRepository({ repository: '192.168.10.117' })
//   .then(dockerRepository.getTagByImage)
//   //   .then(dockerRepository.analyzeImage)
//   .then(data => {
//     data = data.data
//     //  add new image:tag
//     data.images.forEach(image => {
//       image.tags.forEach(tag => {
//         dockerImage
//           .findOneAndUpdate(
//             {
//               repository: `${data.repository}:${data.port}`,
//               image: image.image,
//               tag: tag
//             },
//             {
//               $setOnInsert: {
//                 repository: `${data.repository}:${data.port}`,
//                 image: image.image,
//                 tag: tag,
//                 isEnable: true
//               }
//             },
//             {
//               upsert: true,
//               new: true,
//               setDefaultsOnInsert: true
//             }
//           )
//           .then(doc => {
//             //TODO
//             debug(`${doc.repository}/${doc.image}:${doc.tag} update`)
//           })
//           .catch(err => {
//             warn(err.stack)
//           })
//       })
//     })
//   })
//   .then(function(data) {
//     info(JSON.stringify(data))
//   })
//   .catch(function(err) {
//     error(JSON.stringify(err.stack))
//   })

// repository
//   //   .deleteMany({ repository: '' })
//   .find({})
//   .then(function(data) {
//     info(JSON.stringify(data))
//   })
//   .catch(function(err) {
//     error(JSON.stringify(err.stack))
//   })

// user
//   .find({ username: 'admin' })
//   .then(function(data) {
//     info(JSON.stringify(data))
//   })
//   .catch(function(err) {
//     error(JSON.stringify(err.stack))
//   })

// user
//   .deleteMany({})
//   .then(function(data) {
//     info(JSON.stringify(data))
//   })
//   .catch(function(err) {
//     error(JSON.stringify(err.stack))
//   })

dockerImage
  .find({ $and: [{ repository: '192.168.10.117:5000' }, { isEnable: true }] })
  .then(function(data) {
    info(JSON.stringify(data))
    data.forEach(dat => {
      info(dat.isEnable)
    })
  })
  .catch(function(err) {
    error(JSON.stringify(err.stack))
  })

// dockerImage
//   .deleteMany({ repository: '192.168.10.117:5000' })
//   .then(function(data) {
//     info(JSON.stringify(data))
//   })
//   .catch(function(err) {
//     error(JSON.stringify(err.stack))
//   })
