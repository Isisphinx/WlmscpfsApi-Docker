const { redisClient } = require('config/redisConnection')
const { jsonToString, stringToLowerCase, deleteFile, joinPath } = require('helpers/tools')
const { redisKeyWithNamespace, stringToRedis, isMemberOfRedisSet, redisDeleteKey, redisKeyExist } = require('helpers/redis')
const { addStudiesQueue, pino, worklistDir } = require('config/constants')
const { rsmq } = require('config/rsmqConnection')

/*
TO DO
- Validate json
- Handle different error type
- Separate create and delete study ?
*/

const parseReqWorklistParams = (req) => {
  const { WorklistName, StudyInstanceUID } = req.params
  const worklistNameLowerCase = stringToLowerCase(WorklistName)
  const studyRedisKey = redisKeyWithNamespace(worklistNameLowerCase, StudyInstanceUID)
  return [worklistNameLowerCase, StudyInstanceUID, studyRedisKey]
}

module.exports.createStudyInRedisAndSendToWorker = (req, res) => {
  /*
  worklist name to lowercase -> format redis Key -> check if worklist exists -> json from put -> validate json -> convert json to string -> add json in redis -> add json redis key to worker
  */
  const studyData = req.body
  const [worklistNameLowerCase, StudyInstanceUID, studyRedisKey] = parseReqWorklistParams(req)

  isMemberOfRedisSet('worklist', worklistNameLowerCase, redisClient)
    .then(([redisSet, value]) => studyData)
    .then((data) => jsonToString(data))
    .then(studyDataString => stringToRedis(studyRedisKey, studyDataString, redisClient))
    .then(([redisKey, dataString]) => rsmq.sendMessage({ qname: addStudiesQueue, message: redisKey }))
    .then(sendMessageValue => {
      pino.debug('Added study to database and queue', studyRedisKey, sendMessageValue)
      res.send('202')
      return sendMessageValue
    })
    .catch(err => {
      pino.error('Error trying to add study', err, studyRedisKey, studyData)
      res.send('400')
    })
}

module.exports.deleteStudy = (req, res) => {
  /*
  Check if study exist -> Delete worklist file -> Delete study in db
  */
  const [worklistNameLowerCase, StudyInstanceUID, studyRedisKey] = parseReqWorklistParams(req)
  const worklistFilePath = joinPath(worklistDir, worklistNameLowerCase, StudyInstanceUID + '.wl')

  redisKeyExist(studyRedisKey, redisClient)
    .then((key) => deleteFile(worklistFilePath))
    .then((file) => redisDeleteKey(studyRedisKey, redisClient))
    .then(key => {
      pino.debug('Deleted study', key)
      res.send('200')
      return key
    })
    .catch(err => {
      pino.error('Error trying to delete study', studyRedisKey, err)
      res.send('400')
    })
}