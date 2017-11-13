const RSMQWorker = require('rsmq-worker')
const { spawn } = require('child_process')

const redisConnection = require('config/redisConnection')
const tools = require('helpers/tools')
const constants = require('config/constants')

const redisClient = redisConnection.redisClient
const addStudiesQueue = constants.addStudiesQueue

/*
Refator : 
Add study to redis directly from route then pass to worker study id. [1]
Put utility function in separate file. [2]
*/

// RSMQ Worker
const studyWorker = new RSMQWorker(addStudiesQueue, { redis: redisClient, interval: [.2, 1, 3], autostart: true })

studyWorker.on('error', function (err, msg) {
  tools.logToConsole(err, 'Worker error on message id', msg.id)
})
studyWorker.on('exceeded', function (msg) {
  tools.logToConsole(addStudiesQueue, 'Queue exceeded', msg.id)
})
studyWorker.on('timeout', function (msg) {
  tools.logToConsole(addStudiesQueue, 'Message timeout', msg.id + ' ' + msg.rc)
})

studyWorker.on("message", (msg, next, id) => {
  tools.logToConsole(msg, 'Message received by worker', addStudiesQueue)
  const jsonData = tools.returnJson(msg)
  const dumpData = returnDump(jsonData)
  const dumpFile = returnDumpFilePath(constants.worklistDir, jsonData)

  tools.writeFile([dumpFile, dumpData]).then(data => convertDumpToWorklistFile(data)).then(data => tools.deleteFile(dumpFile)).then(data => { next() }).catch(err => { tools.logToConsole(err, 'Error creating worklist file')})
})

module.exports.studyWorker = studyWorker


  /* [1]
    const msgJson = JSON.parse(msg)
    // Format study in redis
    redisClient.hset([msgJson.WorklistName + ':' + msgJson.StudyInstanceUID,
      'PatientName', msgJson.PatientName,
      'PatientBirthDate', msgJson.PatientBirthDate,
      'PatientSex', msgJson.PatientSex,
      'PatientID', msgJson.PatientID,
      'RequestedProcedureDescription', msgJson.RequestedProcedureDescription,
      'Modality', msgJson.Modality,
      'ScheduledStationAETitle', msgJson.ScheduledStationAETitle,
      'ScheduledProcedureStepStartDate', msgJson.ScheduledProcedureStepStartDate,
      'ScheduledProcedureStepStartTime', msgJson.ScheduledProcedureStepStartTime,
      'ScheduledProcedureStepDescription', msgJson.ScheduledProcedureStepDescription,
      'ScheduledProcedureStepID', msgJson.ScheduledProcedureStepID,
      'RequestedProcedureID', msgJson.RequestedProcedureID,
      'status', 'processing'], (err, res) => {
        if (err) throw err
      })
  */

// [2]
const returnDump = (json) => {
  return `(0010,0010) PN ${json.PatientName}
(0010,0020) LO ${json.PatientID}
(0010,0030) DA ${json.PatientBirthDate}
(0010,0040) CS ${json.PatientSex}
(0020,000d) UI ${json.StudyInstanceUID}
(0032,1060) LO ${json.RequestedProcedureDescription}
(0040,0100) SQ
(fffe,e000) -
(0008,0060) CS ${json.Modality}
(0040,0001) AE ${json.ScheduledStationAETitle}
(0040,0002) DA ${json.ScheduledProcedureStepStartDate}
(0040,0003) TM ${json.ScheduledProcedureStepStartTime}
(0040,0007) LO ${json.ScheduledProcedureStepDescription}
(0040,0009) SH ${json.ScheduledProcedureStepID}
(fffe,e00d) -
(fffe,e0dd) -
(0040,1001) SH ${json.RequestedProcedureID}`
}

const returnDumpFilePath = (worklistDir, json) => {
  return `${worklistDir}/${json.WorklistName}/${json.StudyInstanceUID}`
}

const convertDumpToWorklistFile = (dumpFile) => {
  return new Promise((resolve, reject) => {
    dcmFile = dumpFile + '.wl'
    let err = ''
    const dump2dcm = spawn('dump2dcm/dump2dcm', ['+te', dumpFile, dcmFile], { 'env': { 'DCMDICTPATH': 'dump2dcm/dicom.dic' } })
    dump2dcm.stderr.on('data', (data) => {
      err += data.toString()
    })
    dump2dcm.on('close', (code) => {
      (code === 0) ? resolve(dcmFile) : reject(err)
    })
  })
}