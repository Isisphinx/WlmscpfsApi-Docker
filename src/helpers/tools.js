const fs = require('fs')
const path = require('path')

// To improve : include a log level and multiple optional
module.exports.logToConsole = (log, text, optional = '') => {
  const time = new Date().toLocaleString() 
  console.log(time,':', text, optional, '----', log)
  return log
}

module.exports.promiseToConsole = (log, text, optional) => {
  return Promise.resolve(module.exports.logToConsole(log, text, optional))
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