const timedScan = require('../services/timedScan');
const { info, error } = require('../services/logger');
const { connectToMongodb } = require('../services/express');

connectToMongodb()

// timedScan.initTimedScan();
// timedScan.destroyTimedScan();

timedScan.needScan()
.then(function (data) {
    info(data);
})