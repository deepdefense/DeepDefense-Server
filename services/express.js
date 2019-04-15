const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const path = require('path')

// session
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const cookieParser = require('cookie-parser')
// body parse
const bodyParser = require('body-parser')

// local require
var config = require('./config.js')
var logger = require('./logger.js')
var user = require('../collections/user.js')
var auth = require('../middlewares/isAuth.js')  //  认证判断
const repository = require('../collections/repository');
const dockerImage = require('../collections/image');
const dockerRepository = require('./dockerRepository');
const {
    dbException
} = require('../class/exceptions');

var sessionOption = {
    resave: true,  //  save the session to the session store
    saveUninitialized: true,  //  
    secret: 'uwotm8',
    cookie: {
        path: '/',  //  cookie
        httpOnly: true,  //  use http or https
        secure: false,  
        maxAge: null,  //  expires time in millionsecond
        // expires: ,
    }
    // name: 
    // proxy: 
    // rolling:
    // store:
    // unset:
}

// main logical
function startApp() {
    console.log('welcome to use, server is going to start');
    var app = express();
    connectToMongodb();
    initApp(app);
    /**ready to update image collections */
    repository.find({})
    .then(function (docs) {
        return new Promise(function (resolve, reject) {
            docs.forEach(function (doc) {
                dockerRepository.getImageByRepository(doc.repository)
                .then(getTagByImage)
                .then(function (data) {
                    return new Promise(function (resolve, reject) {
                        data.images.forEach(function (image) {
                            image.tag.forEach(function (tag) {
                                dockerImage.findOneAndUpdate({
                                    repository: data.repository,
                                    image: image.image,
                                    tag: tag
                                }, { $set: {
                                    name: data.name,
                                    repository: data.repository,
                                    image: image.image,
                                    tag: tag
                                } }, { upsert: true, setDefaultsOnInsert: true })
                                .then(function (data) { /**TODO */ })
                                .catch(function (err) { warn(err) });
                            });
                        });
                    });
                })
                .catch(function (err) { reject(err); });
            });
        });
    })
    .catch(function (err) { warn(err); });
    var server = http.Server(app);
    server.listen(app.get('port'), function () {
        logger.info('listen at port:' + app.get('port'));
    });
}

/**
 * inie app
 * @param {express()} app 
 */
function initApp(app) {
    app.set('port', config.port.http)
    // load body parse middleware 
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(cookieParser())

    // load seesion middleware
    app.use(session(sessionOption))  //  session处理

    // config and load passport
    // cookie验证
    passport.use(new LocalStrategy(user.authenticate())) // 设置passport验证策略
    passport.serializeUser(user.serializeUser())  // passport将user对象序列化为cookie值
    passport.deserializeUser(user.deserializeUser())  //  passport将cookie值反序列化为user对象
    app.use(passport.initialize())  //  passport初始化
    app.use(passport.session())  //  引入passport的session, passport会检查cookie并填充req.user
    
    // load static source
    // app.use(express.static(path.join(__dirname, 'public')))
    logger.debug('middware load done');

    
    // 添加response header, 解决跨域问题
    app.use(require('../middlewares/resHeader'));

    // app.use('/auth', require('./routers/index.js'));  // 认证
    app.use('/api/repository', auth, require('../routers/repositoryRouter'));
    app.use('/api/scanner', auth, require('../routers/scannerRouter'));
    app.use('/api/score', auth, require('../routers/scoreRouter'));
}

/**
 * connecte to the mongodb
 */
function connectToMongodb() {

    function connect() {
        var options = {
            // server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
            // replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
            useNewUrlParser: true
        };
        logger.debug(config.database);
        var connct = mongoose.connect(config.database.toString(), options);
    }

    connect()  // connect to the mongodb
    mongoose.connection.on('error', (err) => {
        logger.error(err);
    }).on('disconnected', () => {
        connect();  // reconnect to the mongodb
    }).on('open', () => {
        logger.info('connect to the ' + config.database.toString());
    });
}

module.exports = {
    startApp,
    connectToMongodb
};