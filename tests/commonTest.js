const common = require('../services/common');
const { info, error } = require('../services/logger');

common.get({
    url: 'http://192.168.10.118:5000/v2/_catalog',
    username: 'abc',
    passwd: 'abc123'
})
.then(function (data) { info(JSON.stringify(data)); })
.catch(function (error) { error(JSON.stringify(error)); });