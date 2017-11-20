const isRequired = (name) => {
  throw new Error(name + 'is required')
}

module.exports.stringToRedis = (key, dataString, redis = isRequired('redis')) => { // Add the specified string to redis
  return new Promise((resolve, reject) => {
    redis.set(key, dataString, (err, res) => {
      if (err) reject(err)
      resolve([key, dataString])
    })
  })
}

module.exports.getRedisString = (key, redis = isRequired('redis')) => { // Fetch the redis key data
  return new Promise((resolve, reject) => {
    redis.get(key, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}

module.exports.redisKeyExist = (key, redis = isRequired('redis')) => { // Check if the specified key exist in redis
  return new Promise((resolve, reject) => {
    redis.exists(key, (err, res) => {
      if (err) reject(err)
      res === 1 ? resolve(key) : reject(`key ${key} does not exists`)
    })
  })
}

module.exports.isMemberOfRedisSet = (set, value, redis = isRequired('redis')) => { // Check if the value is a member of the set
  return new Promise((resolve, reject) => {
    redis.sismember(set, value, (err, res) => {
      if (err) reject(err)
      res === 1 ? resolve([set, value]) : reject(`${value} is not a member of ${set}`)
    })
  })
}
module.exports.isNotMemberOfRedisSet = (set, value, redis = isRequired('redis')) => { // Check if the value is a member of the set
  return new Promise((resolve, reject) => {
    redis.sismember(set, value, (err, res) => {
      if (err) reject(err)
      res === 0 ? resolve([set, value]) : reject(`${value} is a member of ${set}`)
    })
  })
}

module.exports.redisDeleteKey = (key, redis = isRequired('redis')) => { // Delete Key in redis
  return new Promise((resolve, reject) => {
    redis.del(key, (err, res) => {
      if (err) reject(err)
      resolve(key)
    })
  })
}

module.exports.redisAddValueToRedisSet = (set, value, redis = isRequired('redis')) => { // Add value to redis Set
  return new Promise((resolve, reject) => {
    redis.sadd(set, value, (err, res) => {
      if (err) reject(err)
      res === 1 ? resolve([set, value]) : reject(`${value} already exists in ${set}`)
    })
  })
}

module.exports.redisKeyWithNamespace = (...args) => args.join(':')

module.exports.parseRedisKey = (key) => key.split(":")