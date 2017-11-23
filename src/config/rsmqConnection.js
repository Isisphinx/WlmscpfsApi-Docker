const RSMQPromise = require('rsmq-promise')

const { redisClient } = require('config/redisConnection')
const { addStudiesQueue, pino, redisHost, redisPort } = require('config/constants')

const rsmq = new RSMQPromise({ host: redisHost, port: redisPort, ns: 'rsmq' })

const returnError = (err) => {
  throw err
}
const valueIstInArray = (myArray, value) => {
  return myArray.includes(value)
}
const createQueueIfNonExist = (queueToCreate, rsmqConnection) => {
  rsmqConnection.listQueues()
    .then(queues => valueIstInArray(queues, queueToCreate))
    .then((worklistExists) => worklistExists ? returnError('Worklist already exists') : rsmqConnection.createQueue({ qname: queueToCreate }))
    .then(value => { pino.info('Rsmq queue', queueToCreate, 'created') })
    .catch(err => { pino.error(err, 'Error Creating Rsmq queue', queueToCreate) })
}

createQueueIfNonExist(addStudiesQueue, rsmq)

module.exports.rsmq = rsmq