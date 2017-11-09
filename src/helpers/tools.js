module.exports.logToConsole = (log, text, optional) => {
    optionalVal = optional || '';
    const logString = `${text} *${optionalVal}* --- ${log}`
    console.log(logString)
    return logString
}