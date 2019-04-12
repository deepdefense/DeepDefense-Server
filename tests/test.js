const { dbException } = requrie('../class/exceptions');

function fun() {
    return new Promise(function (resolve, reject) {
        resolve(123);
    });
}

// function fun1() {
//     return new Promise(function (resovle, reject) {

//     })
// }

try {
    fun()
    .then(function (data) {
        throw new Error(123)
    })
    .catch(function (error) {
        throw new dbException(error)
    });
} catch(error) {
    console.log(error);
}