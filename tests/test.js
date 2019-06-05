const { dbException } = require('../class/exceptions')
const { get } = require('../services/util')
const { debug } = require('../services/logger')

function fun() {
  return new Promise(function(resolve, reject) {
    resolve(123)
  })
}

// function fun1() {
//     return new Promise(function (resovle, reject) {

//     })
// }

// try {
//     fun()
//     .then(function (data) {
//         throw new Error(123)
//     })
//     .catch(function (error) {
//         throw new dbException(error)
//     });
// } catch(error) {
//     console.log(error);
// }

get({
  url: 'http://192.168.4.56',
  username: null,
  passwd: null
})
  .then()
  .catch(err => {
    debug(err)
  })
