module.exports.addStudiesQueue = 'addStudies'
module.exports.worklistDir = 'worklistDir'
module.exports.logLevel = 1
module.exports.redisHost = 'redis'
module.exports.redisPort = 6379
module.exports.pino = require('pino')({ "level": "debug", "prettyPrint": { "forceColor": true } })
module.exports.worklistListSet='worklistList'