const Clair = require('clair-client');
const repository = require('../collections/repository');
const dockerImage = require('../collections/image'); 
const dockerVulnerability = require('../collections/vulnerability');
const conf = require('../collections/config');
const socket = require('../services/socketClient');
const common = require('./common');
const { debug, info, warn, error } = require('./logger');
const config = require('./config');
const {
    dbException,
    clairException,
    paramsException
} = require('../class/exceptions');

/**
 * 
 */
function testRepository(data) {
    return new Promise(function (resolve, reject) {
        let dcrApiCheck = {
            url: `${data.isHttps ? 'https' : 'http'}://${data.repository}${data.port ? `:${data.port}` : ``}/v2`,
            username: data.isAuth && data.username !== '' ? data.username : null,
            passwd: data.isAuth && data.passwd !== '' ? data.passwd : null,
        };
        debug(`request:${JSON.stringify(dcrApiCheck)}`);
        common.get(dcrApiCheck)
        .then(function (data) {
            info(`testRepository: complete`);
            resolve(true);
        })
        .catch(function (err) {
            warn(`testRepository: faild`);
            resolve(false);
        });
    });
}


/**
 * data: { repository }
 */
function getImageByRepository(data) {
    let tempDoc = {}
    return new Promise(function (resolve ,reject) {
        repository.findOne({ repository: data.repository })
        .then(function (doc) {
            debug(`DB: complete`);
            return new Promise(function (resolve ,reject) {
                if (doc) {
                    tempDoc = doc
                    let dcrApi_catalog = {
                        url: `${doc.isHttps ? 'https' : 'http'}://${doc.repository}${doc.port ? `:${doc.port}` : ``}/v2/_catalog`,
                        username: doc.isAuth && doc.username !== '' ? doc.username : null,
                        passwd: doc.isAuth && doc.passwd !== '' ? doc.passwd : null,
                    };
                    debug(`request:${JSON.stringify(dcrApi_catalog)}`);
                    resolve(dcrApi_catalog);
                }
                else { throw new dbException(`No such data in DB`); }
            });
        }, function (err) { throw new dbException(err); })
        .then(common.get)
        .then(function (data) {
            info(`getImageByRepository: complete`);
            resolve({
                name: tempDoc.name,
                repository: tempDoc.repository,
                isHttps: tempDoc.isHttps,
                isAuth: tempDoc.isAuth,
                username: tempDoc.username,
                passwd: tempDoc.passwd,
                port: tempDoc.port,
                images: data.repositories
            });
        })
        .catch(function (err) {
            warn(`getImageByRepository: faild`);
            reject(err);
        });
    });
}

/**
 * data: { repository, isHttps, isAuth, username, passwd, port, images }
 */
function getTagByImage(data) {
    let errors = new Array();
    return new Promise(async function (resolve, reject) {
        if (!data) {
            reject(new paramsException(`repository or image illegel`));
        }
        if (data.images && data.images.length > 0) {
            for( let i in data.images ) {
                let dcrApiTagList = {
                    url: `${data.isHttps ? 'https' : 'http'}://${data.repository}:${data.port}/v2/${data.images[i]}/tags/list`,
                    username: data.isAuth && data.username !== '' ? data.username : null,
                    passwd: data.isAuth && data.passwd !== '' ? data.passwd : null,
                }
                // debug(`request:${JSON.stringify(dcrApiTagList)}`);
                try {
                    data.images[i] = {
                        image: data.images[i],
                        tags: (await common.get(dcrApiTagList)).tags
                    };
                } catch (err) {
                    errors.push({ repository: data.repository, image: image, error: err });
                }
            }
            info(`getTagByImage: complete`);
            resolve({ data, errors });
        }
        else {
            info(`getTagByImage: complete`);
            resolve({ data, errors });
        }
    });
}

/**
 * data: { name, repository, image, tag }
 */
function saveImageToDB(data) {
    return new Promise(function (resolve, reject) {
        dockerImage.findOneAndUpdate(data, {}, { upsert: true })
        .then(function (data) {
            if (!data) {
                debug(`create a doc`);
            } else {
                debug(`exit, do nothing`);
            } resolve();
        })
        .catch(function (err) { reject(err); });
    });
}

/**
 * data: { repository, port, username, passwd, isHttps, isAuth, images }
 */
function analyzeImage(data) {
    return new Promise(function (resolve, reject) {
        if (data.errors.length > 0) { resolve({ data: `there are some errors, now start to analyze image`, errors: data.errors }); }
        data = data.data;
        data.images.forEach(function (image) {
            image.tags.forEach(function (tag) {
                clairAnalyze({
                    repository: data.repository,
                    port: data.port,
                    usaername: data.username,
                    passwd: data.passwd,
                    isHttps: data.isHttps,
                    isAuth: data.isAuth,
                    image: image.image,
                    tag: tag
                })
                .then(function (analyzeResult) {
                    dockerImage.findOneAndUpdate({
                        repository: analyzeResult.result.repository,
                        image: analyzeResult.result.image,
                        tag: analyzeResult.result.tag,
                    }, { $set: {
                        namespace: analyzeResult.result.namespace,
                        high: analyzeResult.result.high,
                        medium: analyzeResult.result.medium,
                        low: analyzeResult.result.low,
                        negligible: analyzeResult.result.negligible,
                        unknown: analyzeResult.result.unknown,
                        score: analyzeResult.result.score
                    } })
                    .then(function (doc) {
                        if (doc) {
                            info(`socket: send a fresh`);
                            socket.emit('fresh', function () { info(`DB: fresh`); });
                        }
                        else { throw new dbException(`No such data`); }
                    })
                    .catch(function (err) { warn(`${data.repository}:${data.port}/${image.image}:${tag} save fail: ${err}`) });

                    dockerVulnerability.deleteMany({
                        repository: analyzeResult.result.repository,
                        image: analyzeResult.result.image,
                        tag: analyzeResult.result.tag
                    })
                    .then(function () {
                        info(`vulnerability remove`)
                        analyzeResult.vulnerabilities.forEach(function (vul) {
                            dockerVulnerability.create({
                                repository: analyzeResult.result.repository,
                                image: analyzeResult.result.image,
                                tag: analyzeResult.result.tag,
                                cveId: vul.Name,
                                description: vul.Description,
                                link: vul.Link,
                                level: vul.Severity,
                                type: vul.VulName,
                                versionFormat: vul.VersionFormat,
                                version: vul.Version
                            })
                            .then(function (doc) {
                                info(`vulnerability save`)
                            })
                            .catch(function (err) { warn(`vulnerability save fail`); });
                        });
                    })
                    .catch(function (err) { warn(`vulnerability remove fail`); });
                })
                .catch(function (err) { 
                    // warn(JSON.stringify(err.stack))
                    warn(`${data.repository}:${data.port}/${image.image}:${tag} analyze fail: ${err}`); });
            });
        });
    });
}

/**
 * data: { repository, port, username, passwd, isHttps, isAuth, image, tag }
 */
function clairAnalyze(data) {
    let vulnerabilities = new Array();
    let result = new Object();
    return new Promise(function (resolve, reject) {
        repository.findOne({ repository: data.repository })
        .then(function (doc) {
            return new Promise(function (resolve ,reject) {
                let { host, port } = config.clair;
                let clairOption = { clairAddress: `${host}:${port}` };
                if (doc.isAuth) {
                    clairOption.dockerUsername = doc.username;
                    clairOption.dockerPassword = doc.passwd;
                }
                if (doc.isHttps) {
                    clairOption.dockerInsecure = true;
                }
                // debug(JSON.stringify(clairOption));
                const clair = new Clair(clairOption);
                let image = `${doc.isHttps ? `https` : `http` }://${data.repository}:${data.port}/${data.image}:${data.tag}`;
                // debug(image);
                clair.analyze({ image })
                .then(async function (analyzeResult) {
                    result = {
                        repository: `${data.repository}:${data.port}`,
                        image: data.image,
                        tag: data.tag,
                        namespace: analyzeResult.vulnerabilities[0].NamespaceName
                    }
                    let [ high, medium, low, negligible, unknown ] = [ 0, 0, 0, 0, 0 ];
                    let levels = { high, medium, low, negligible, unknown };
                    for( let vul1 of analyzeResult.vulnerabilities ) {
                        for ( let vul2 of vul1.Vulnerabilities ) {
                            levels[vul2.Severity.toLowerCase()]++;
                            vulnerabilities.push(Object.assign(vul2, {
                                VulName: vul1.Name,
                                VersionFormat: vul1.VersionFormat,
                                Version: vul1.Version
                            }));
                        }
                    }
                    result = Object.assign(result, levels);
                    result.score = await calScore(result);
                    resolve({ vulnerabilities, result });
                })
                .catch(function (error) { reject(new clairException(error)) });
            });
        })
        .then(function (data) {
            resolve(data);
        })
        .catch(function (err) {
            reject(err);
        })
    });
}

function calScore(data) {
    let score = sum = 0;
    return new Promise(function (resolve, reject) {
        conf.findOne({ key: 'SCORE' })
        .then(function (doc) {
            if (doc) {
                let levels = Object.keys(doc.config);
                for (level of levels) {
                    score += data[level] * doc.config[level];
                    sum += data[level];
                }
                info(`calScore: complete`);
                resolve((score / (doc.config.high * sum)));
            }
            else { throw new dbException(`No such config info`); }
        })
        .catch(function (err) {
            warn(`calScore: fail`)
            reject(err);
        });
    });
}

module.exports = {
    testRepository,
    getImageByRepository,
    getTagByImage,
    saveImageToDB,
    clairAnalyze,
    calScore,
    analyzeImage
};