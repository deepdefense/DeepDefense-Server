const dockerRepository = require('../services/dockerRepository');
const repository = require('../collections/repository');
const { info, error } = require('../services/logger');
const { connectToMongodb } = require('../services/express');
const dockerImage = require('../collections/image'); 

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

// dockerImage.find({})
// .then(function (data) { info(JSON.stringify(data)); })
// .catch(function (err) { error(JSON.stringify(err)); });

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

dockerRepository.getImageByRepository({ repository: '192.168.10.118' })
.then(dockerRepository.getTagByImage)
.then(dockerRepository.analyzeImage)
.then(function (data) { info(JSON.stringify(data)); })
.catch(function (err) { error(JSON.stringify(err.stack)); });

