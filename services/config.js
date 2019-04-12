const fs = require('fs');
const path = require('path');

var config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json')).toString());

module.exports = config;