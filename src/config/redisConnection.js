const redis = require('redis')

const { logToConsole } = require('helpers/tools')
const { redisHost, redisPort } = require('config/constants')

const redisClient = redis.createClient(redisPort, redisHost)

redisClient.on('connect', () => {logToConsole('Connected', 'Redis Client on', 1, redisHost, redisPort)})
redisClient.on('error', (err) => {logToConsole(err, 'Redis Connection Error', 1, redisHost, redisPort)})

module.exports.redisClient = redisClient