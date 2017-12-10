/*
global rootRequire
*/

const path = require('path')

const { redisClient } = rootRequire('config/redisConnection')
const { stringToLowerCase, returnErrorString, returnFilesPath } = rootRequire('helpers/tools')
const { isNotMemberOfRedisSet, redisAddValueToRedisSet } = rootRequire('helpers/redis')
const { pinoPromise, deleteArrayOfFiles, fs } = rootRequire('helpers/promise')
const { pino, worklistDir, worklistListSet } = rootRequire('config/constants')

module.exports.createWorklist = (req, res) => {
  /*
  worklist name to lowercase -> check if worklist exist
  -> Create worklist in db -> create worklist folder -> initialize worklist with lockfile
  */
  const worklistNameLowerCase = stringToLowerCase(req.params.WorklistName)
  const worklistPath = path.join(worklistDir, worklistNameLowerCase)
  const lockFile = path.join(worklistPath, 'lockfile')

  isNotMemberOfRedisSet(worklistListSet, worklistNameLowerCase, redisClient)
    .then(data => pinoPromise.trace(data, 'createWorklist()', 'isNotMemberOfRedisSet'))

    .then(([set, value]) => redisAddValueToRedisSet(set, value, redisClient))
    .then(data => pinoPromise.trace(data, 'createWorklist()', 'redisAddValueToRedisSet'))

    .then(() => fs.mkdirAsync(worklistPath))
    .then(data => pinoPromise.trace(data, 'createWorklist()', 'fs.mkdirAsync(worklistPath)'))

    .then(() => fs.writeFileAsync(lockFile, ''))
    .then(data => pinoPromise.trace(data, 'createWorklist()', "fs.writeFileAsync(lockFile, '')"))

    .then((pathLockFile) => {
      pino.debug('createWorklist()', 'Created worklist', worklistNameLowerCase, pathLockFile)
      res.send('200')
      return pathLockFile
    })
    .catch((err) => {
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
  Prevent deleting of lockfile : remove it from array
  */
  const worklistNameLowerCase = stringToLowerCase(req.params.WorklistName)
  const worklistPath = path.join(worklistDir, worklistNameLowerCase)

  redisClient.sismember(worklistListSet, worklistNameLowerCase)
    .then(worklistExists => worklistExists || returnErrorString('Worklist does not exist'))
    .then(() => fs.readdirAsync(worklistPath))
    .then(files => returnFilesPath(files, worklistPath))
    .then(filesWithPath => deleteArrayOfFiles(filesWithPath))
    .then(data => pinoPromise.trace(data, 'deleted files in worklist'))
    .then(() => {
      pino.debug(worklistNameLowerCase, 'worklist purged')
      res.send('200')
    })
    .catch((err) => { pino.error(err, 'Error purging worklist', worklistNameLowerCase) })
}

// redisClient.keys(req.params.WorklistName.toLowerCase() + ':*', (err, keys) => {
//         if (err) throw err
//         keys.forEach(function (key) {
//           redisClient.del(key)
//         })
//       })
