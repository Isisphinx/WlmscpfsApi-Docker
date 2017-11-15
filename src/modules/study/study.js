const redisConnection = require('config/redisConnection')
const { toPromise, returnJson, jsonToString, logToConsole, promiseToConsole, redisKeyWithNamespace } = require('helpers/tools')
const path = require('path')

const redisClient = redisConnection.redisClient

/*
json from put -> validate json -> convert to string -> add in redis -> set study to processing -> add to worker
*/

const stringToRedis = (key, dataString, redis) => {
  return new Promise((resolve, reject) => {
    redis.set(key, dataString, (err, res) => {
      if (err) reject(err)
      resolve([key, dataString])
    })
  })
}

const getRedisString = (key, redis) => {
  return new Promise((resolve, reject) => {
    redis.get(key, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}

const keytest = redisKeyWithNamespace('myNS', '123')
const testobject = { 'name': 'joe', 'nestedObj': { 'dob': '23011999' }, 'nestedArray': [{ 'A': '1' }, { 'B': '2' }] }

toPromise(testobject)

  .then(data => toPromise(jsonToString(data)))
  .then(data => promiseToConsole(data, 'jsonToString'))

  .then(data => stringToRedis(keytest, data, redisClient))
  .then(data => promiseToConsole(data, 'stringtoredis', '**'))

  .then(([key]) => getRedisString(key, redisClient))
  .then(data => promiseToConsole(data, 'getredis'))
  .then(value => { logToConsole(value, 'final value') })
  .catch(err => { logToConsole(err, 'catch') })


/*
TO DO
Put study : put study in db then worker to convert to file
put study multiple procedure step : multiple file
delete study : delte file first then in db
*/