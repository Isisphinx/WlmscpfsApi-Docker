module.exports.addStudiesQueue = 'addStudies'
module.exports.worklistDir = 'worklistDir'
module.exports.logLevel = 1
module.exports.redisHost = 'redis'
module.exports.redisPort = 6379
const logger = require('pino')
module.exports.pino = logger({ "level": "trace", "prettyPrint": { "forceColor": true }})
module.exports.worklistListSet = 'worklistList'