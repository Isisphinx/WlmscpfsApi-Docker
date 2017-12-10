/*
global rootRequire
*/

const RSMQPromise = require('rsmq-promise')

const {
  addStudiesQueue, pino, redisHost, redisPort,
} = rootRequire('config/constants')
const { returnErrorString, valueIstInArray } = rootRequire('helpers/tools')

const rsmq = new RSMQPromise({ host: redisHost, port: redisPort, ns: 'rsmq' })

const createQueueIfNonExist = (queueToCreate, rsmqConnection) => {
  rsmqConnection.listQueues()
    .then(queues => valueIstInArray(queues, queueToCreate))
    .then(worklistExists => (worklistExists ? returnErrorString('Worklist already exists') : rsmqConnection.createQueue({ qname: queueToCreate })))
    .then(() => { pino.info('Rsmq queue', queueToCreate, 'created') })
    .catch((err) => { pino.error(err, 'Error Creating Rsmq queue', queueToCreate) })
}

createQueueIfNonExist(addStudiesQueue, rsmq)

module.exports.rsmq = rsmq
