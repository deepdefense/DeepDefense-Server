const dockerRepository = require('../services/dockerRepository')
const conf = require('../collections/config')
const user = require('../collections/user')
const repository = require('../collections/repository')
const { debug, info, warn, error } = require('../services/logger')
const { connectToMongodb } = require('../services/common')
const dockerImage = require('../collections/image')

connectToMongodb()

dockerRepository
  .getImageByRepository({
    name: '测试124',
    repository: '192.168.3.124',
    port: 5000,
    username: 'abc',
    passwd: 'abc123',
    isAuth: false,
    isHttps: false
  })
  .then(dockerRepository.getTagByImage)
  // .then(dockerRepository.removeImages)
  .then(dockerRepository.analyzeImage)
  .then(function(data) {
    info(JSON.stringify(data))
  })
  .catch(function(err) {
    error(JSON.stringify(err.stack))
  })

// dockerRepository
//   .clairAnalyze({
//     repository: '192.168.3.124',
//     port: 5000,
//     username: '',
//     passwd: '',
//     isHttps: false,
//     isAuth: false,
//     image: 'mongo',
//     tag: 'latest'
//   })
//   .then(function(data) {
//     info(JSON.stringify(data))
//   })
//   .catch(function(err) {
//     error(JSON.stringify(err.stack))
//   })

// dockerRepository.freshRepository()
