const util = require('../services/util');
const { info, error } = require('../services/logger');

util.get({
    url: 'http://192.168.10.118:5000/v2/_catalog',
    username: 'abc',
    passwd: 'abc123'
})
.then(function (data) { info(JSON.stringify(data)); })
.catch(function (error) { error(JSON.stringify(error)); });