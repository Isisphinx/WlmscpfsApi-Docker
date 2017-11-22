const redis = require('redis')

const { redisHost, redisPort, pino } = require('config/constants')

const redisClient = new Redis(redisPort, redisHost) 

redisClient.on('connect', () => { pino.info('Redis client connected to host', `${redisHost}:${redisPort}`) })
redisClient.on('error', (err) => { pino.error('Redis Connection Error', `${redisHost}:${redisPort}`, err) })

module.exports.redisClient = redisClient