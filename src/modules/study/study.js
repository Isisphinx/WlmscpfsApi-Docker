/*
global rootRequire
*/
const path = require('path')

const { redisClient } = rootRequire('config/redisConnection')
const { stringToLowerCase } = rootRequire('helpers/tools')
const {
  redisKeyWithNamespace, stringToRedis, isMemberOfRedisSet, redisDeleteKey, redisKeyExist,
} = rootRequire('helpers/redis')
const { fs } = rootRequire('helpers/promise')
const {
  addStudiesQueue, pino, worklistDir, worklistListSet,
} = rootRequire('config/constants')
const { rsmq } = rootRequire('config/rsmqConnection')

/*
TO DO
- Validate json
- Extract function out of req res
- Handle different error type
- Separate create and delete study ?
*/

const parseReqWorklistParams = (req) => {
  const { WorklistName, StudyInstanceUID } = req.params
  const worklistNameLowerCase = stringToLowerCase(WorklistName)
  const studyRedisKey = redisKeyWithNamespace(worklistNameLowerCase, StudyInstanceUID)
  return [worklistNameLowerCase, studyRedisKey, StudyInstanceUID]
}

module.exports.createStudy = (req, res) => {
  /*
  worklist name to lowercase -> format redis Key -> check if worklist exists
  -> json from put -> validate json -> convert json to string
  -> add json in redis -> add json redis key to worker
  */
  const studyData = req.body
  const [worklistNameLowerCase, studyRedisKey] = parseReqWorklistParams(req)

  isMemberOfRedisSet(worklistListSet, worklistNameLowerCase, redisClient)
    .then(() => studyData)
    .then(data => JSON.stringify(data))
    .then(studyDataString => stringToRedis(studyRedisKey, studyDataString, redisClient))
    .then(([redisKey]) => rsmq.sendMessage({ qname: addStudiesQueue, message: redisKey }))
    .then((sendMessageValue) => {
      pino.debug('Added study to database and queue', studyRedisKey, sendMessageValue)
      res.send('202')
      return sendMessageValue
    })
    .catch((err) => {
      pino.error(err, 'Error trying to add study', studyRedisKey, studyData)
      res.send('400')
    })
}

module.exports.deleteStudy = (req, res) => {
  /*
  Check if study exist -> Delete worklist file -> Delete study in db
  */
  const [worklistNameLowerCase, studyRedisKey, StudyInstanceUID] = parseReqWorklistParams(req)
  const worklistFilePath = path.join(worklistDir, worklistNameLowerCase, `${StudyInstanceUID}.wl`)

  redisKeyExist(studyRedisKey, redisClient)
    .then(() => fs.unlinkAsync(worklistFilePath))
    .then(() => redisDeleteKey(studyRedisKey, redisClient))
    .then((key) => {
      pino.debug('Deleted study', key)
      res.send('200')
      return key
    })
    .catch((err) => {
      pino.error(err, 'Error trying to delete study', studyRedisKey)
      res.send('400')
    })
}
