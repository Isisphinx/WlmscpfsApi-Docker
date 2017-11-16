
const { redisClient } = require('config/redisConnection')
const { toPromise, jsonToString, logToConsole, promiseToConsole, redisKeyWithNamespace } = require('helpers/tools')

const { stringToRedis, getRedisString } = require('./study')

module.exports = (app) => { // PUT study to create or update study
  app.put('/:WorklistName/:StudyInstanceUID', (req, res) => {
    const studyData = req.body
    const { WorklistName, StudyInstanceUID } = req.params
    const studyRedisKey = redisKeyWithNamespace(WorklistName, StudyInstanceUID)

    logToConsole(studyData, 'PUT', 1, WorklistName, StudyInstanceUID)
    jsonData = req.body
    toPromise(studyData)
      .then(data => toPromise(jsonToString(data)))
      .then(data => stringToRedis(studyRedisKey, data, redisClient))
      .then(([key]) => getRedisString(key, redisClient))
      .then(value => {
        logToConsole(value, 'final value')
        res.send('202')
      })
      .catch(err => { logToConsole(err, 'catch', 0) })
  })

  app.delete('/:WorklistName/:StudyInstanceUID', (req, res) => { // DELETE study

  })

}