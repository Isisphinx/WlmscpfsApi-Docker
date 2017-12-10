/*
global rootRequire
*/

const Redis = require('ioredis')

const { redisHost, redisPort, pino } = rootRequire('config/constants')

const redisClient = new Redis(redisPort, redisHost)

redisClient.on('connect', () => { pino.info('Redis client connected to host', `${redisHost}:${redisPort}`) })
redisClient.on('error', (err) => { pino.error(err, 'Redis Connection Error', `${redisHost}:${redisPort}`) })

module.exports.redisClient = redisClient
