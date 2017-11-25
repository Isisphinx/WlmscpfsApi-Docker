const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

const { pino } = require('config/constants')

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

module.exports.deleteArrayOfFiles = (filesArray) => {
  return Promise.map(filesArray, (file) => fs.unlinkAsync(file).then(data => file).catch(err => {
    pino.error(err, 'Error deleting file')
    return { 'err': err.cause.path }
  }))
}

module.exports.makeDir = (path) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (err) => {
      if (err) reject(err)
      resolve(path)
    })
  })
}

module.exports.readDir = (path) => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) reject(err)
      resolve(files)
    })
  })
}

module.exports.pinoPromise = {}

module.exports.pinoPromise.fatal = (arg, ...text) => {
  pino.fatal(arg, ...text)
  return arg
}
module.exports.pinoPromise.error = (arg, ...text) => {
  pino.error(arg, ...text)
  return arg
}

module.exports.pinoPromise.info = (arg, ...text) => {
  pino.info(arg, ...text)
  return arg
}
module.exports.pinoPromise.debug = (arg, ...text) => {
  pino.debug(arg, ...text)
  return arg
}
module.exports.pinoPromise.trace = (arg, ...text) => {
  pino.trace(arg, ...text)
  return arg
}