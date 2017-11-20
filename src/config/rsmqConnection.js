const RSMQPromise = require('rsmq-promise')

const { redisClient } = require('config/redisConnection')
const { addStudiesQueue, pino } = require('config/constants')

/*
TO DO
- Handle different error type
*/

const rsmq = new RSMQPromise({ client: redisClient, ns: "rsmq" })

const valueNotInArray = (myArray, value) => {
  if (myArray.includes(value)) throw (value + ' is already in array')
  return [myArray, value]
}

rsmq.listQueues()
  .then(queues => valueNotInArray(queues, addStudiesQueue))
  .then(([myArray, value]) => rsmq.createQueue({ qname: value }))
  .then(value => { pino.info('Rsmq queue', addStudiesQueue, 'created') })
  .catch(err => {
    pino.error('Error Creating Rsmq queue', addStudiesQueue, err)
  })

module.exports.rsmq = rsmq