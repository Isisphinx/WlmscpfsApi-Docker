const { redisClient } = require('config/redisConnection')
const { toPromise, jsonToString, logToConsole, promiseToConsole, stringToLowerCase } = require('helpers/tools')
const { redisKeyWithNamespace, getRedisString, stringToRedis } = require('helpers/redis')
const { addStudiesQueue } = require('config/constants')
const { rsmq } = require('config/rsmqConnection')

/*
TO DO
- check if worklist exist
- validate json
- delete study : delte file first then in db
- rename 'data' in promise to corresponding name 
*/

module.exports = (app) => {
  app.put('/:WorklistName/:StudyInstanceUID', (req, res) => { // PUT study to create or update study
    /*
    worklistname to lowercase -> make redis Key -> check if worklist exist -> json from put -> validate json -> convert json to string -> add json in redis -> add json redis key to worker
    */
    const studyData = req.body
    const { WorklistName, StudyInstanceUID } = req.params
    const worklistNameLowerCase = stringToLowerCase(WorklistName)
    const studyRedisKey = redisKeyWithNamespace(worklistNameLowerCase, StudyInstanceUID)

    logToConsole(studyData, 'PUT', 1, worklistNameLowerCase, StudyInstanceUID)

    toPromise(studyData)
      .then(data => toPromise(jsonToString(data)))
      .then(data => stringToRedis(studyRedisKey, data, redisClient))
      .then(data => rsmq.sendMessage({ qname: addStudiesQueue, message: studyRedisKey }))
      .then(value => {
        logToConsole(value, 'Added study', 1, studyData, studyRedisKey)
        res.send('202')
      })
      .catch(err => {
        logToConsole(err, 'Added study error', 1, worklistNameLowerCase, StudyInstanceUID, studyData)
        res.send('404')
      })
  })

  app.delete('/:WorklistName/:StudyInstanceUID', (req, res) => { // DELETE study

  })

}