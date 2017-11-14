const fs = require('fs')

// To improve : include a log level and multiple optional
module.exports.logToConsole = (log, text, optional) => {
  optionalVal = optional ? ` *${optional}* ` : ' '
  const logString = `${text}${optionalVal}--- ${log}`
  console.log(logString)
  return log
}

module.exports.writeFile = ([file, data]) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject(err)
      resolve(file)
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

module.exports.returnJson = (string) => JSON.parse(string)