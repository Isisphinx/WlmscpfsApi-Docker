const fs = require('fs')

// To improve : include a log level and multiple optional and time
module.exports.logToConsole = (log, text, optional) => {
  const optionalVal = optional ? ` *${optional}* ` : ' '
  const logString = `${text}${optionalVal}--- ${log}`
  console.log(logString)
  return log
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

module.exports.promiseLog = (log,text) => {
  const logString = `${text} --- ${log}`
  
  console.log(logString)
  return Promise.resolve(log)
}

module.exports.toProm=(syncFunction)=>{
  return Promise.resolve(syncFunction)
}

module.exports.returnJson = (string) => JSON.parse(string)