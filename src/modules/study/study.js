const redisConnection = require('config/redisConnection')
const { promiseLog, toProm, returnJson } = require('helpers/tools')
const redisClient = redisConnection.redisClient

/*
json from put -> validate json -> convert to array -> add in redis -> set study to processing -> add to worker
*/

const simpleObjectToArray = (myObject) => { //Take an object end return an array 
  let myArray = []
  Object.keys(myObject).map((key, index) => {
    if (typeof myObject[key] === ('object'||'array')) throw 'Nested object not allowed in simpleObjectToArray()'
    myArray.push(key)
    myArray.push(myObject[key])
  })
  return myArray
}

const redisNamespaceKey = (namespace, key) => { //Return a key with a namespace for redis
  const namespacedKey = namespace + ':' + key
  return namespacedKey
}

// hset does not replace the key
const arrayToRedisHash = (key, dataArray, redis) => { //Create or replace redis hset with dataArray at key 
  return new Promise((resolve, reject) => {
    let arrayWithKey = dataArray
    arrayWithKey.unshift(key)
    redis.hset(arrayWithKey, (err, res) => {
      if (err) reject(err)
      resolve([key, dataArray])
    })
  })
}

const getRedisHash = (key, redis) => {
  return new Promise((resolve, reject) => {
    redis.hgetall(key, (err, res) => {
      if (err) reject(err)
      if (!res) reject(`getRedisHash responded ${res} -- Key ${key} doesn't exist`)
      resolve(res)
    })

  })
}

const keytest = redisNamespaceKey('myNS', '123')
const testobject = { 'name': 'joe', 'nestedObj': { 'dob': '23011999' }, 'nestedArray': [{ 'A': '1' }, { 'B': '2' }] }

toProm(testobject)

  .then(data => toProm(simpleObjectToArray(data)))
  .then(data => promiseLog(data, 'objecToArray'))

  .then(data => arrayToRedisHash(keytest, data, redisClient))
  .then(([key]) => getRedisHash(key, redisClient))
  .then(value => { console.log('final value', value.nestedObj) })
  .catch(err => { console.log('catch',err) })


/*
TO DO
Put study : put study in db then worker to convert to file
put study multiple procedure step : multiple file
delete study : delte file first then in db
*/