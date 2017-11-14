const redisConnection = require('config/redisConnection')

const redisClient = redisConnection.redisClient

/*
json from put -> validate json -> convert to array -> add in redis -> set study to processing -> add to worker
*/


// Bug return [ 'name', 'joe', 'test', '[object Object]' ]
// hset does not replace totaly the key
const objectToArray = (myObject) => { //Take an object end return an array 
  let myArray = []
  Object.keys(myObject).map((key, index) => {
    myArray.push(key)
    myArray.push(myObject[key].toString())
  })
  return myArray
}

const redisNamespaceKey = (namespace, key) => { //Return a key with a namespace for redis
  const namespacedKey = namespace + ':' + key
  return namespacedKey
}

const arrayToRedisHash = (key, dataArray, redis) => { //Insert dataArray in redis hset at key
  return new Promise((resolve, reject) => {
    let arrayWithKey = dataArray
    arrayWithKey.unshift(key)
    redis.hset(arrayWithKey, (err, res) => {
      if (err) reject(err)
      resolve(key)
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

const keytest = redisNamespaceKey('myNS','123')
const testobject = {'name':'joe','test':{'hey':'hello'}}

Promise.resolve(testobject)

.then(data=>Promise.resolve(objectToArray(data)))
.then(value=>{console.log(value)})

// .then(data=>arrayToRedisHash(keytest,data,redisClient))
// .then(data=>getRedisHash(data, redisClient))
// .then(value=>{console.log(value)})
// .catch(err=>{console.log(err)})


/*
TO DO
Put study : put study in db then worker to convert to file
put study multiple procedure step : multiple file
delete study : delte file first then in db
*/