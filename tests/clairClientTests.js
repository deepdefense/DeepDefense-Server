const Clair = require('clair-client');

let clairOption = {
    clairAddress: 'http://192.168.10.112:6060',
    // dockerInsecure: true
    // dockerUsername: `abc,
    // dockerPassword: `abc123`
}

async function fun(clairOption) {
    const clair = new Clair(clairOption)
    clair.analyze({ image: 'http://192.168.10.118:5000/ubuntu:16.04'})
    .then((data) => {
        console.log(data);
        console.log(data.vulnerabilities[0])
    })
    .catch((error) => {
        console.log(error);
    })
}

fun(clairOption)