const Redis = require('ioredis')

const { redisHost, redisPort, pino } = require('./constants')
const { connectToRedis } = require('../helpers/redis')

const redisClient = new Redis(redisPort, redisHost)

connectToRedis(redisClient)
  .then((data) => { pino.info(data, `${redisHost}:${redisPort}`) })
  .catch((err) => { pino.error(err, 'Redis Connection Error', `${redisHost}:${redisPort}`) })

module.exports.redisClient = redisClient
