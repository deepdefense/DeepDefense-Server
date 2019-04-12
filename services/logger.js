const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const path = require('path');
// common services
const config = require('./config');

var tiemFormat = config.log.timeFormat;

const logger = createLogger({
    level: config.log.consoleLevel,
    format: combine(
        timestamp(),
        printf((info) => {
            var date = new Date(info.timestamp)
            return `${getFormatTime(date, tiemFormat)} [${info.level}]: ${info.message}`
        })
    ),
    transports: [
        new transports.Console({ level: 'debug' })
        // new winston.transports.File({ filename: path.join(__dirname, `/../config.log.infoPath${config.log.infoPath}`), level: 'info' }),
        // new winston.transports.File({ filename: path.join(__dirname, `/../config.log.infoPath${config.log.errorPath}`), level: 'error' })
    ]
});

function getFormatTime(date, format) {
    var [ year, month, day ] = date.toLocaleDateString().split('-');
    var [ hour, minute, second ] = date.toLocaleTimeString().split(':');

    // console.log(year, month, day, hour, minute, second)
    if (format.indexOf('YYYY') > -1) {
        format = format.replace('YYYY', year);
    } else if (format.indexOf('YY') > -1) {
        format = format.replace('YY', year.substring(2,3));
    }
    if (format.indexOf('MO') > -1) {
        format = format.replace('MO', month);
    }
    if (format.indexOf('DD') > -1) {
        format = format.replace('DD', day);
    }
    if (format.indexOf('HH') > -1) {
        format = format.replace('HH', hour);
    }
    if (format.indexOf('MM') > -1) {
        format = format.replace('MM', minute);
    }
    if (format.indexOf('SS') > -1) {
        format = format.replace('SS', second);
    }
    
    return format;
}

function funcInfo() {
    var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
    var stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;
    var stacklist = (new Error()).stack.split('\n').slice(3);
    var s = stacklist[9];
    // console.log(stacklist)
    var sp = stackReg.exec(s) || stackReg2.exec(s);
    var data = {};
    if (sp && sp.length === 5) {
        data.method = sp[1];
        data.path = sp[2];
        data.line = sp[3];
        data.position = sp[4];
        data.file = path.basename(data.path);
    }
    return data;
}

module.exports = logger;