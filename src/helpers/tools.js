const fs = require('fs')
const path = require('path')
const {logLevel} = require('config/constants')

module.exports.logToConsole = (log, text, level = 1, ...args) => {
  const time = new Date().toLocaleString()
  if (level <= logLevel) console.log(time, ':', text, ...args, '----', log)
  return log
}

module.exports.promiseToConsole = (...args) => {
  return Promise.resolve(module.exports.logToConsole(...args))
}

module.exports.writeFile = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject(err)
      resolve([file, data])
    })
  })
}

module.exports.deleteFile = (file) => {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => {
      if (err) reject(err)
      resolve(file)
    })
  })
}

module.exports.toPromise = (syncFunction) => Promise.resolve(syncFunction)

module.exports.joinPath = (...args) => path.join(...args)

module.exports.returnJson = (string) => JSON.parse(string)

module.exports.jsonToString = (string) => JSON.stringify(string)

module.exports.redisKeyWithNamespace = (...args) => args.join(':')