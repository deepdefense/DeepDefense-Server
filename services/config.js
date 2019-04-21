const fs = require('fs');
const path = require('path');

let confPath = process.env.NODE_ENV == 'dev' ? path.join(__dirname, '../config.json') : '/etc/deepdefense/scannerConf.json';

var config = process.env.NODE_ENV == 'dev' ? JSON.parse(fs.readFileSync(confPath).toString()).dev : JSON.parse(fs.readFileSync(confPath).toString()).pro;

module.exports = config;
