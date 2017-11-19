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

module.exports.redisKeyExist = (key, redis) => {
  return new Promise((resolve, reject) => {
    redis.exists(key, (err, res) => {
      if (err) reject(err)
        (resp === 1) ? resolve(key) : reject(`key ${key} does not exists`)
    })
  })
}

module.exports.isMemberOfRedisHash = (key, member, redis) => {
  return new Promise((resolve, reject) => {
    redis.sismember(key, member, (err, res) => {
      if (err) reject(err)
      res === 1 ? resolve([key, member]) : reject(`${member} is not a member of ${key}`)
    })
  })
}

module.exports.redisKeyWithNamespace = (...args) => args.join(':')

module.exports.parseRedisKey = (key) => key.split(":")