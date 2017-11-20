const RSMQWorker = require('rsmq-worker')

const { redisClient } = require('config/redisConnection')
const { writeFile, returnJson, deleteFile, joinPath } = require('helpers/tools')
const { getRedisString, parseRedisKey } = require('helpers/redis')
const { addStudiesQueue, worklistDir, pino } = require('config/constants')
const { returnDump, convertDumpToWorklistFile } = require('./dumpFile.js')
const { pinoPromise } = require('helpers/promise')

/*
TO DO
- multiple procedure step -> multiple file
*/

const studyWorker = new RSMQWorker(addStudiesQueue, { redis:redisClient, interval: [.05, 1, 3], autostart: true }) // Throw an error as it also silently create the queue

studyWorker.on('error', function (err, msg) {
  pino.error('Worker error on message id', msg.id, err)
})
studyWorker.on('exceeded', function (msg) {
  pino.warn('Queue exceeded', addStudiesQueue, msg.id)

})
studyWorker.on('timeout', function (msg) {
  pino.warn('Message timeout', addStudiesQueue, msg.id, msg.rc)
})

studyWorker.on("message", (msg, next, id) => {
  pino.debug('Message received by worker', addStudiesQueue, msg)
  const [worklistName, StudyInstanceUID] = parseRedisKey(msg)
  const dumpFilePath = joinPath(worklistDir, worklistName, StudyInstanceUID)

  getRedisString(msg, redisClient)
  .then(data => pinoPromise.trace(data, 'studyWorker.on("message")', 'getRedisString'))
    
  .then(redisDataString => returnJson(redisDataString))
  .then(data => pinoPromise.trace(data, 'studyWorker.on("message")', 'returnJson'))

    .then(redisDataObject => returnDump(redisDataObject))
    .then(data => pinoPromise.trace(data, 'studyWorker.on("message")', 'returnDump'))

    .then(dumpData => writeFile(dumpFilePath, dumpData))
    .then(data => pinoPromise.trace(data, 'studyWorker.on("message")', 'writeFile'))

    .then(([filePath]) => convertDumpToWorklistFile(filePath))
    .then(data => pinoPromise.trace(data, 'studyWorker.on("message")', 'convertDumpToWorklistFile'))

    .then(data => deleteFile(dumpFilePath))
    .then(data => pinoPromise.trace(data, 'studyWorker.on("message")', 'deleteFile'))

    .then(dumpFile => {
      pino.debug('Created worklist file', dumpFile)
      next()
      return dumpFile
    })
    .catch(err => { pino.error('Error creating worklist file', err) })
})

module.exports.studyWorker = studyWorker