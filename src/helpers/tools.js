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

module.exports.makeDir = (path) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (err) => {
      if (err) reject(err)
      resolve(path)
    })
  })
}

module.exports.returnFilesPath = (files, path) => {
  return files.reduce((accumulator, file) => {
    const pathFile = module.exports.joinPath(path, file)
    accumulator.push(pathFile)
    return accumulator
  }, [])
}

module.exports.toPromise = (syncFunction) => Promise.resolve(syncFunction)

module.exports.joinPath = (...args) => path.join(...args)

module.exports.returnJson = (string) => JSON.parse(string)

module.exports.jsonToString = (string) => JSON.stringify(string)

module.exports.stringToLowerCase = (string) => string.toLowerCase()

module.exports.returnErrorString = (err) => {throw err}

module.exports.valueIstInArray = (myArray, value) => myArray.includes(value)