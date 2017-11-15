const simpleObjectToArray = (myObject) => { //Take an object end return an array 
  let myArray = []
  Object.keys(myObject).map((key, index) => {
    if (typeof myObject[key] === ('object' || 'array')) throw 'Nested object not allowed in simpleObjectToArray()'
    myArray.push(key)
    myArray.push(myObject[key])
  })
  return myArray
}

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