const fs = require('fs')
const path = require('path')

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

module.exports.stringToLowerCase = (string) => string.toLowerCase()