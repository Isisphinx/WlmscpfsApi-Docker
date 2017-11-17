module.exports.stringToRedis = (key, dataString, redis) => {
  return new Promise((resolve, reject) => {
    redis.set(key, dataString, (err, res) => {
      if (err) reject(err)
      resolve([key, dataString])
    })
  })
}

module.exports.getRedisString = (key, redis) => {
  return new Promise((resolve, reject) => {
    redis.get(key, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}

module.exports.redisKeyWithNamespace = (...args) => args.join(':')

module.exports.parseRedisKey= (key)=>key.split(":")