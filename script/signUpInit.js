const mongoose = require('mogoose');
const { config } = require('../services/common');
const User = require('../collections/user.js');
const { debug, info, error, warn } = require('../services/logger');

function connect() {
    let options = {
        // server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
        // replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
        useNewUrlParser: true
    };
    debug(config.database);
    let connct = mongoose.connect(config.database.toString(), options);
}

connect()  // connect to the mongodb
mongoose.connection.on('error', (err) => {
    error(err);
}).on('disconnected', () => {
    connect();  // reconnect to the mongodb
}).on('open', () => {
    info('connect to the ' + config.database.toString());
});

let defaultUser = {
    
};

User.deleteMany({})
.then(() => {
    return new Promise((resolve, reject) => {
        User.create(defaultUser)
        .then((doc) => { resolve(doc); })
        .catch((error) => { reject(error); });
    });
})
.catch((error) => { error(error); });