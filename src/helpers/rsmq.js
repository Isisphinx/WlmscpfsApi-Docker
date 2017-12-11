const { returnErrorString, valueIstInArray } = require('./tools')

module.exports.createQueueIfNonExist = (queueToCreate, rsmqConnection) => (
  rsmqConnection.listQueues()
    .then(queues => valueIstInArray(queues, queueToCreate))
    .then(worklistExists => (worklistExists ? returnErrorString('Worklist already exists') : rsmqConnection.createQueue({ qname: queueToCreate })))
)
