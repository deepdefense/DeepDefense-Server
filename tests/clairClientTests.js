const Clair = require('clair-client');
const { debug } = require('../services/logger');

let clairOption = {
    clairAddress: 'http://192.168.10.112:6060',
    // dockerInsecure: true
    // dockerUsername: `abc,
    // dockerPassword: `abc123`
}

async function fun(clairOption) {
    const clair = new Clair(clairOption)
    clair.analyze({ image: 'https://registry-1.docker.io/ubuntu'})
    .then((data) => {
        console.log(data);
        console.log(data.vulnerabilities[0]);
    })
    .catch((error) => {
        console.log(error);
    })
}

fun(clairOption);

// const common = require(`../node_modules/docker-registry-client/lib/common`);

// debug(JSON.stringify(common.parseRepo(`jack777/defense-scanner`)));