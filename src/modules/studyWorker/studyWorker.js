const RSMQWorker = require('rsmq-worker')
const { spawn } = require('child_process')

const { redisClient } = require('config/redisConnection')
const { logToConsole, writeFile, returnJson, deleteFile, toPromise, joinPath } = require('helpers/tools')
const { getRedisString, parseRedisKey } = require('helpers/redis')
const { addStudiesQueue, worklistDir } = require('config/constants')
const { returnDump, convertDumpToWorklistFile } = require('./dumpFile.js')

/*
TO DO
- multiple procedure step -> multiple file
*/

const studyWorker = new RSMQWorker(addStudiesQueue, { redis: redisClient, interval: [.05, 1, 3], autostart: true }) // Throw an error as it also silently create the queue

studyWorker.on('error', function (err, msg) {
  logToConsole(err, 'Worker error on message id', 1, msg.id)
})
studyWorker.on('exceeded', function (msg) {
  logToConsole(addStudiesQueue, 'Queue exceeded', 1, msg.id)
})
studyWorker.on('timeout', function (msg) {
  logToConsole(addStudiesQueue, 'Message timeout', 1, msg.id, msg.rc)
})

studyWorker.on("message", (msg, next, id) => {
  logToConsole(msg, 'Message received by worker', 1, addStudiesQueue)
  const [worklistName, StudyInstanUID] = parseRedisKey(msg)
  const dumpFilePath = joinPath(worklistDir, worklistName, StudyInstanUID)

  getRedisString(msg, redisClient)
    .then(studyDataString => toPromise(returnJson(studyDataString)))
    .then(studyData => toPromise(returnDump(studyData)))
    .then(data => writeFile(dumpFilePath, data))
    .then(([data]) => convertDumpToWorklistFile(data))
    .then(data => deleteFile(dumpFilePath))
    .then(dumpFile => {
      logToConsole(dumpFile, 'Created worklist file', 1)
      next()
    })
    .catch(err => { logToConsole(err, 'Error creating worklist file', 1) })
})

module.exports.studyWorker = studyWorker