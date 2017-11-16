const RSMQWorker = require('rsmq-worker')
const { spawn } = require('child_process')

const redisConnection = require('config/redisConnection')
const { logToConsole, writeFile, returnJson, deleteFile, toPromise, joinPath } = require('helpers/tools')
const constants = require('config/constants')

const redisClient = redisConnection.redisClient
const addStudiesQueue = constants.addStudiesQueue

// RSMQ Worker
const studyWorker = new RSMQWorker(addStudiesQueue, { redis: redisClient, interval: [.05, 1, 3], autostart: true })

studyWorker.on('error', function (err, msg) {
  logToConsole(err, 'Worker error on message id', 0, msg.id)
})
studyWorker.on('exceeded', function (msg) {
  logToConsole(addStudiesQueue, 'Queue exceeded', 1,  msg.id)
})
studyWorker.on('timeout', function (msg) {
  logToConsole(addStudiesQueue, 'Message timeout', 1, msg.id, msg.rc)
})

studyWorker.on("message", (msg, next, id) => {
  logToConsole(msg, 'Message received by worker', 1, addStudiesQueue)
  const jsonData = returnJson(msg)
  const dumpFilePath = joinPath(constants.worklistDir, jsonData.WorklistName, jsonData.StudyInstanceUID)

  toPromise(returnDump(jsonData))
    .then(data => writeFile(dumpFilePath, data))
    .then(([data]) => convertDumpToWorklistFile(data))
    .then(() => deleteFile(dumpFilePath))
    .then(() => { next() })
    .catch(err => { logToConsole(err, 'Error creating worklist file',0) })
})

module.exports.studyWorker = studyWorker

// TO DO
// Put utility functions in separate file :
// 
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