const { pino, } = require('config/constants')

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