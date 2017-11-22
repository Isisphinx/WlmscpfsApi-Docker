const RSMQPromise = require('rsmq-promise')

const { redisClient } = require('config/redisConnection')
const { addStudiesQueue, pino, redisHost, redisPort } = require('config/constants')


/*
TO DO
- Handle different error type
*/

const rsmq = new RSMQPromise({ host: redisHost, port: redisPort, ns: "rsmq" })

const valueNotInArray = (myArray, value) => {
  if (myArray.includes(value)) throw (value + ' is already in array')
  return [myArray, value]
}

rsmq.listQueues()
  // .then(queues => valueNotInArray(queues, addStudiesQueue))
  .then(([myArray, value]) =>  hello.createQueue({ qname: value }))

  .then(value => { pino.info('Rsmq queue', addStudiesQueue, 'created') })
  .catch(err => {
    // console.log(err)
    pino.error(err,'Error Creating Rsmq queue', addStudiesQueue)
  }) 
 
