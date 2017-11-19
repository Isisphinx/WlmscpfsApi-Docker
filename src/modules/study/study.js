const { redisClient } = require('config/redisConnection')
const { toPromise, jsonToString, logToConsole, promiseToConsole, stringToLowerCase } = require('helpers/tools')
const { redisKeyWithNamespace, stringToRedis, isMemberOfRedisHash } = require('helpers/redis')
const { addStudiesQueue, pino } = require('config/constants')
const { rsmq } = require('config/rsmqConnection')

/*
TO DO
- validate json
- handle different error type
*/

module.exports.createStudyInRedisAndSendToWorker = (req, res) => {
  /*
  worklist name to lowercase -> make redis Key -> check if worklist exist -> json from put -> validate json -> convert json to string -> add json in redis -> add json redis key to worker
  */
  const studyData = req.body
  const { WorklistName, StudyInstanceUID } = req.params
  const worklistNameLowerCase = stringToLowerCase(WorklistName)
  const studyRedisKey = redisKeyWithNamespace(worklistNameLowerCase, StudyInstanceUID)

  isMemberOfRedisHash('worklist', worklistNameLowerCase, redisClient)
    .then(() => studyData)
    .then(jsonToString)
    .then(studyDataString => stringToRedis(studyRedisKey, studyDataString, redisClient))
    .then(([redisKey, dataString]) => rsmq.sendMessage({ qname: addStudiesQueue, message: redisKey }))
    .then(sendMessageValue => {
      logToConsole(sendMessageValue, 'Added study', 1, studyData, studyRedisKey)
      res.send('202')
      return sendMessageValue
    })
    .catch(err => {
      logToConsole(err, 'Error trying to add study', 1, worklistNameLowerCase, StudyInstanceUID, studyData)
      res.send('404')
    })
}