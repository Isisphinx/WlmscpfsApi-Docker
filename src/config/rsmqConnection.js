const RSMQPromise = require('rsmq-promise')

const {redisClient} = require('config/redisConnection')
const constants = require('config/constants')
const { logToConsole, toPromise } = require('helpers/tools')

const rsmq = new RSMQPromise({ client: redisClient, ns: "rsmq" })
const addStudiesQueue = constants.addStudiesQueue

const valueNotInArray = (myArray, value) => {
  if (myArray.includes(value)) throw ('Value ' + value + ' is already in array')
  return [myArray, value]
}

rsmq.listQueues()
  .then(queues => toPromise(valueNotInArray(queues, addStudiesQueue)))
  .then(([myArray, value]) => rsmq.createQueue({ qname: value }))
  .then(value => { logToConsole(addStudiesQueue, 'rsmq queue created') })
  .catch(err => {
    logToConsole(err, 'Error Creating Rsmq queue', 1, addStudiesQueue)
  })

module.exports.rsmq = rsmq