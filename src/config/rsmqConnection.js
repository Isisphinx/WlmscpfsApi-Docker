const RSMQPromise = require('rsmq-promise')

const redisConnection = require('config/redisConnection')
const constants = require('config/constants')
const { logToConsole, toPromise } = require('helpers/tools')

const redisClient = redisConnection.redisClient
const rsmq = new RSMQPromise({ client: redisClient, ns: "rsmq" })
const addStudiesQueue = constants.addStudiesQueue

/*
TO DO
Vérifier si la queu existe avant de créer
*/
const valueNotInArray = (myArray, value) => {
  if (myArray.includes(value)) throw ('Value ' + value + ' is already in array')
  return [myArray, value]
}

rsmq.listQueues()
  .then(queues => toPromise(valueNotInArray(queues, addStudiesQueue)))
  .then(([myArray, value]) => rsmq.createQueue({ qname: value }))

  .then(done => {
    logToConsole(done, 'Rsmq queue created',1,addStudiesQueue)
  }).catch(err => {
    logToConsole(err, 'Error Creating Rsmq queue', 1, addStudiesQueue)
  })


module.exports.rsmq = rsmq;