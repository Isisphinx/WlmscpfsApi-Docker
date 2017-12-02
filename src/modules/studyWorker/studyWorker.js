const RSMQWorker = require('rsmq-worker')
const path = require('path')

const { redisClient } = require('config/redisConnection')
const { getRedisString, parseRedisKey } = require('helpers/redis')
const { addStudiesQueue, worklistDir, pino, redisHost, redisPort } = require('config/constants')
const { returnDump, convertDumpToWorklistFile } = require('./dumpFile.js')
const { pinoPromise, fs } = require('helpers/promise')

/*
TO DO
- multiple procedure step -> multiple file
*/

const studyWorker = new RSMQWorker(addStudiesQueue, { host: redisHost, port: redisPort, interval: [.05, 1, 3], autostart: true, redisPrefix: 'rsmq' }) // Throw an error as it also silently create the queue

studyWorker.on('error', function (err, msg) {
  pino.error(err, 'Worker error on message id', msg.id)
})
studyWorker.on('exceeded', function (msg) {
  pino.warn('Queue exceeded', addStudiesQueue, msg.id)

})
studyWorker.on('timeout', function (msg) {
  pino.warn('Message timeout', addStudiesQueue, msg.id, msg.rc)
})

studyWorker.on("message", (msg, next, id) => {
  pino.debug(msg, 'Message received by worker', addStudiesQueue)
  const [worklistName, StudyInstanceUID] = parseRedisKey(msg)
  const dumpFilePath = path.join(worklistDir, worklistName, StudyInstanceUID)

  getRedisString(msg, redisClient)
    .then(data => pinoPromise.trace(data, 'studyWorker.on("message")', 'getRedisString'))

    .then(redisDataString => JSON.parse(redisDataString))
    .then(data => pinoPromise.trace(data, 'studyWorker.on("message")', 'JSON.parse(redisDataString)'))

    .then(redisDataObject => returnDump(redisDataObject))
    .then(data => pinoPromise.trace(data, 'studyWorker.on("message")', 'returnDump'))

    .then(dumpData => fs.writeFileAsync(dumpFilePath, dumpData))
    .then(data => pinoPromise.trace(data, 'studyWorker.on("message")', 'fs.writeFileAsync(dumpFilePath, dumpData)'))

    .then(([filePath]) => convertDumpToWorklistFile(filePath))
    .then(data => pinoPromise.trace(data, 'studyWorker.on("message")', 'convertDumpToWorklistFile'))

    .then(data => fs.unlinkAsync(dumpFilePath))
    .then(data => pinoPromise.trace(data, 'studyWorker.on("message")', 'fs.unlinkAsync(dumpFilePath)'))

    .then(dumpFile => {
      pino.debug('Created worklist file', dumpFile)
      next()
      return dumpFile
    })
    .catch(err => { pino.error(err, 'Error creating worklist file') })
})

module.exports.studyWorker = studyWorker