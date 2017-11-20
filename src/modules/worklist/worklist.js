const { redisClient } = require('config/redisConnection')
const { joinPath, makeDir, writeFile, stringToLowerCase } = require('helpers/tools')
const { isNotMemberOfRedisSet, redisAddValueToRedisSet } = require('helpers/redis')
const { pinoPromise } = require('helpers/promise')
const { pino, worklistDir, worklistListSet } = require('config/constants')

module.exports.createWorklist = (req, res) => {
  /*
  worklist name to lowercase -> check if worklist exist -> Create worklist in db -> create worklist folder -> initialize worklist with lockfile
  */
  const worklistNameLowerCase = stringToLowerCase(req.params.WorklistName)
  const worklistPath = joinPath(worklistDir, worklistNameLowerCase)
  const lockFile = joinPath(worklistPath, 'lockfile')

  isNotMemberOfRedisSet(worklistListSet, worklistNameLowerCase, redisClient)
    .then(data => pinoPromise.trace(data, 'createWorklist()', 'isNotMemberOfRedisSet'))

    .then(([set, value]) => redisAddValueToRedisSet(set, value, redisClient))
    .then(data => pinoPromise.trace(data, 'createWorklist()', 'redisAddValueToRedisSet'))

    .then(([set, value]) => makeDir(worklistPath))
    .then(data => pinoPromise.trace(data, 'createWorklist()', 'makeDir'))

    .then((path) => writeFile(lockFile, ''))
    .then(data => pinoPromise.trace(data, 'createWorklist()', 'writeFile'))

    .then(pathLockFile => {
      pino.debug('createWorklist()', 'Created worklist', worklistNameLowerCase, pathLockFile)
      res.send('200')
      return pathLockFile
    })
    .catch(err => {
      pino.error('createWorklist()', 'Error trying to create worklist', worklistNameLowerCase, err)
      res.send('400')
    })
}