const { redisClient } = require('config/redisConnection')
const { joinPath, makeDir, writeFile, stringToLowerCase, returnErrorString, returnFilesPath } = require('helpers/tools')
const { isNotMemberOfRedisSet, redisAddValueToRedisSet } = require('helpers/redis')
const { pinoPromise, readDir, deleteFilesList, deleteArrayOfFiles } = require('helpers/promise')
const { pino, worklistDir, worklistListSet } = require('config/constants')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

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
      pino.error(err, 'createWorklist()', 'Error trying to create worklist', worklistNameLowerCase)
      res.send('400')
    })
}

module.exports.purgeWorklist = (req, res) => {
  /*
  Check if worklist exists -> | List all files of worklist -> Delete files
                              | List all member of worklist in redis -> Delete key in redis

  TO DO
  Delete in redis
  Throw error on file delete ?
  Res error on catch
  Prevent deleting of lockfile
  */
  const worklistNameLowerCase = stringToLowerCase(req.params.WorklistName)
  const worklistPath = joinPath(worklistDir, worklistNameLowerCase)

  redisClient.sismember(worklistListSet, worklistNameLowerCase)
    .then(worklistExists => worklistExists || returnErrorString('Worklist does not exist'))
    .then((worklistExists) => fs.readdirAsync(worklistPath))
    .then(files => returnFilesPath(files, worklistPath))
    .then(filesWithPath => deleteArrayOfFiles(filesWithPath))
    .then(data => pinoPromise.trace(data, 'deleted files in worklist'))
    .then(data => {
      pino.debug(worklistNameLowerCase, 'worklist purged')
      res.send('200')
    })
    .catch(err => { pino.error(err, 'Error purging worklist', worklistNameLowerCase) })
}