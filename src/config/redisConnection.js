const redis = require('redis');

module.exports.logToConsole = (log, text, optional) => {
    optionalVal = optional || '';
    const logString = `${text} *${optionalVal}* --- ${log}`
    console.log(logString)
    return logString
}

module.exports.redisClient = redis.createClient(6379, 'redis');



