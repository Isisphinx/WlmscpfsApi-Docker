const RSMQWorker = require('rsmq-worker')

const { redisClient } = require('config/redisConnection')
const { writeFile, returnJson, deleteFile, joinPath } = require('helpers/tools')
const { getRedisString, parseRedisKey } = require('helpers/redis')
const { addStudiesQueue, worklistDir, pino } = require('config/constants')
const { returnDump, convertDumpToWorklistFile } = require('./dumpFile.js')

/*
TO DO
- multiple procedure step -> multiple file
*/

const studyWorker = new RSMQWorker(addStudiesQueue, { redis: redisClient, interval: [.05, 1, 3], autostart: true }) // Throw an error as it also silently create the queue

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
    .then(redisDataString => returnJson(redisDataString))
    .then(redisDataObject => returnDump(redisDataObject))
    .then(dumpData => writeFile(dumpFilePath, dumpData))
    .then(([filePath]) => convertDumpToWorklistFile(filePath))
    .then(data => deleteFile(dumpFilePath))
    .then(dumpFile => {
      pino.debug('Created worklist file', dumpFile)
      next()
      return dumpFile
    })
    .catch(err => { pino.error('Error creating worklist file', dumpFile) })
})

module.exports.studyWorker = studyWorker