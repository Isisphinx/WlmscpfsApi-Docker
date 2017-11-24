const { redisClient } = require('config/redisConnection')
const { joinPath, makeDir, writeFile, stringToLowerCase, returnErrorString } = require('helpers/tools')
const { isNotMemberOfRedisSet, redisAddValueToRedisSet } = require('helpers/redis')
const { pinoPromise, readDir, deleteFilesList } = require('helpers/promise')
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
      pino.error(err, 'createWorklist()', 'Error trying to create worklist', worklistNameLowerCase)
      res.send('400')
    })
}

module.exports.purgeWorklist = (req, res) => {
  /*
  Check if worklist exists -> | List all files of worklist -> Delete files
                              | List all member of worklist in redis -> Delete key in redis
  */
  const worklistNameLowerCase = stringToLowerCase(req.params.WorklistName)
  const worklistPath = joinPath(worklistDir, worklistNameLowerCase)

  redisClient.sismember(worklistListSet, worklistNameLowerCase)
    .then(worklistExists => worklistExists || returnErrorString('Worklist does not exist'))
    .then((worklistExists) => readDir(worklistPath))
    .then((worklistFiles) => deleteFilesList(worklistFiles))
    .then(data => pinoPromise.trace(data, 'Files in worklist'))
    .then(data => {
      pino.debug(worklistNameLowerCase, 'worklist purged')
      res.send('200')
      return data
    })
    .catch(err => { pino.error(err, 'Error purging worklist', worklistNameLowerCase) })
}


// Working on unlink array of files
const worklistPath = joinPath(worklistDir, 'isiswl2')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))
testArray = ['1', '2', '3']
fs.readdirAsync(worklistPath)
.map( (file) => {
  return fs.unlinkAsync(file).catch(err =>  err)
})
  .then(data => { console.log('data', data) })
  .catch(err => { console.log('err', err) })