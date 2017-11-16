const {redisClient} = require('config/redisConnection')

/*
json from put -> validate json -> convert to string -> add in redis -> add to worker

TO DO
put study multiple procedure step : multiple file
delete study : delte file first then in db
*/

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