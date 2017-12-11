const Promise = require('bluebird')

module.exports.connectToRedis = redisClient => (
  new Promise((resolve, reject) => {
    redisClient.on('connect', () => {
      resolve('Redis client connected to host')
    })
    redisClient.on('error', (err) => {
      reject(err)
    })
  })
)

// Add the specified string to redis
module.exports.stringToRedis = (key, dataString, redis) =>
  new Promise((resolve, reject) => {
    redis.set(key, dataString, (err) => {
      if (err) reject(err)
      resolve([key, dataString])
    })
  })

// Fetch the redis key data
module.exports.getRedisString = (key, redis) =>
  new Promise((resolve, reject) => {
    redis.get(key, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })

// Check if the specified key exist in redis
module.exports.redisKeyExist = (key, redis) =>
  new Promise((resolve, reject) => {
    redis.exists(key, (err, res) => {
      if (err) reject(err)
      res === 1 ? resolve(key) : reject(`key ${key} does not exists`)
    })
  })

// Check if the value is a member of the set
module.exports.isMemberOfRedisSet = (set, value, redis) =>
  new Promise((resolve, reject) => {
    redis.sismember(set, value, (err, res) => {
      if (err) reject(err)
      res === 1 ? resolve([set, value]) : reject(`${value} is not a member of ${set}`)
    })
  })

// Check if the value is a member of the set
module.exports.isNotMemberOfRedisSet = (set, value, redis) =>
  new Promise((resolve, reject) => {
    redis.sismember(set, value, (err, res) => {
      if (err) reject(err)
      res === 0 ? resolve([set, value]) : reject(`${value} is a member of ${set}`)
    })
  })

// Delete Key in redis
module.exports.redisDeleteKey = (key, redis) =>
  new Promise((resolve, reject) => {
    redis.del(key, (err) => {
      if (err) reject(err)
      resolve(key)
    })
  })

// Add value to redis Set
module.exports.redisAddValueToRedisSet = (set, value, redis) =>
  new Promise((resolve, reject) => {
    redis.sadd(set, value, (err, res) => {
      if (err) reject(err)
      res === 1 ? resolve([set, value]) : reject(`${value} already exists in ${set}`)
    })
  })

module.exports.redisKeyWithNamespace = (...args) => args.join(':')

module.exports.parseRedisKey = key => key.split(':')
