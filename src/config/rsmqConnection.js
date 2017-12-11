const RSMQPromise = require('rsmq-promise')
const { createQueueIfNonExist } = require('../helpers/rsmq')

const {
  addStudiesQueue, redisHost, redisPort, pino, rsmqNs,
} = require('./constants')

const rsmq = new RSMQPromise({ host: redisHost, port: redisPort, ns: rsmqNs })

createQueueIfNonExist(addStudiesQueue, rsmq)
  .then(() => { pino.info('Rsmq queue', addStudiesQueue, 'created') })
  .catch((err) => { pino.error(err, 'Error Creating Rsmq queue', addStudiesQueue) })

module.exports.rsmq = rsmq
