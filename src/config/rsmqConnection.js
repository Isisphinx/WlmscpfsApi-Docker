const RSMQPromise = require('rsmq-promise')

const { redisClient } = require('config/redisConnection')
const { addStudiesQueue, pino } = require('config/constants')
const { pinoPromise } = require('helpers/promise')

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
  .then(data => pinoPromise.trace(data, 'listQueues', 'listQueues'))

  .then(queues => valueNotInArray(queues, addStudiesQueue))
  .then(data => pinoPromise.trace(data, 'listQueues', 'valueNotInArray'))

  .then(([myArray, value]) => rsmq.createQueue({ qname: value }))
  .then(data => pinoPromise.trace(data, 'listQueues', 'rsmq.createQueue'))

  .then(value => { pino.info('Rsmq queue', addStudiesQueue, 'created') })
  .catch(err => {
    pino.error('Error Creating Rsmq queue', addStudiesQueue, ':', err)
  })

module.exports.rsmq = rsmq