const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

const { pino } = require('../config/constants')

module.exports.fs = fs

module.exports.deleteArrayOfFiles = filesArray => (
  Promise.map(filesArray, file => fs.unlinkAsync(file)
    .then(() => file)
    .catch(() => ({ err: file })))
)

module.exports.toPromise = syncFunction => Promise.resolve(syncFunction)

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
