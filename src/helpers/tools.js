const fs = require('fs')
const path = require('path')

module.exports.returnFilesPath = (files, pathToFolder) => {
  return files.reduce((accumulator, file) => {
    const pathFile = path.join(pathToFolder, file)
    accumulator.push(pathFile)
    return accumulator
  }, [])
}

module.exports.stringToLowerCase = (string) => string.toLowerCase()

module.exports.returnErrorString = (err) => { throw err }

module.exports.valueIstInArray = (myArray, value) => myArray.includes(value)