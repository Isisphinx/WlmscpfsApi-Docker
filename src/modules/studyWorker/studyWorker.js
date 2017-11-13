const RSMQWorker = require('rsmq-worker')
const fs = require('fs')
const { spawn } = require('child_process')

const redisConnection = require('config/redisConnection')
const tools = require('helpers/tools')
const constants = require('config/constants')

const redisClient = redisConnection.redisClient
const addStudiesQueue = constants.addStudiesQueue

/*
Refacor add to redis from route then worker

msgJson -> validate schema -> Dumpfile -> Write dump -> dump to Dcm -> Delete dump

*/
const returnJson = (string) => JSON.parse(string)

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

const test = returnDump(returnJson('{"PatientName":"hello"}'))

const writeDumpFile = ([dumpFile, data]) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(dumpFile, data, (err) => {
      if (err) reject(err)
      resolve(dumpFile)
    })
  })
}

const convertDumpToWorklistFile = (dumpFile) => {
  return new Promise((resolve, reject) => {
    const dump2dcm = spawn('dump2dcm/dump2dcm', ['+te', dumpFile, dumpFile + '.wl'], { 'env': { 'DCMDICTPATH': 'dump2dcm/dicom.dic' } })
    let error=''
    dump2dcm.stderr.on('data', (data) => {
      error += data.toString()
    })
    dump2dcm.on('close', (code) => {
      if (code === 0) {
        resolve(dumpFile)
      } else {
        reject(error)
      }
    })
  })
}

writeDumpFile(['processing/hello', test]).then(data => convertDumpToWorklistFile(data)).catch(err => { console.log('Promise error',err) })


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

  const msgJson = JSON.parse(msg)

  const dumpFile = `(0010,0010) PN ${msgJson.PatientName}
(0010,0020) LO ${msgJson.PatientID}
(0010,0030) DA ${msgJson.PatientBirthDate}
(0010,0040) CS ${msgJson.PatientSex}
(0020,000d) UI ${msgJson.StudyInstanceUID}
(0032,1060) LO ${msgJson.RequestedProcedureDescription}
(0040,0100) SQ
(fffe,e000) -
(0008,0060) CS ${msgJson.Modality}
(0040,0001) AE ${msgJson.ScheduledStationAETitle}
(0040,0002) DA ${msgJson.ScheduledProcedureStepStartDate}
(0040,0003) TM ${msgJson.ScheduledProcedureStepStartTime}
(0040,0007) LO ${msgJson.ScheduledProcedureStepDescription}
(0040,0009) SH ${msgJson.ScheduledProcedureStepID}
(fffe,e00d) -
(fffe,e0dd) -
(0040,1001) SH ${msgJson.RequestedProcedureID}`

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

      fs.writeFile('processing/' + msgJson.StudyInstanceUID, dumpFile, (err) => {
        if (err) throw err
        const dump2dcm = spawn('dump2dcm/dump2dcm', ['processing/' + msgJson.StudyInstanceUID, 'worklistDir/' + msgJson.WorklistName + '/' + msgJson.StudyInstanceUID + '.wl'], { 'env': { 'DCMDICTPATH': 'dump2dcm/dicom.dic' } })
        dump2dcm.stderr.on('data', (data) => {
        })
        dump2dcm.on('close', (code) => {
          if (code === 0) {
            fs.unlinkSync('processing/' + msgJson.StudyInstanceUID)
            redisClient.hset([msgJson.WorklistName + ':' + msgJson.StudyInstanceUID, 'status', 'done'], (err, res) => {
              if (err) throw err
              next()
            })
          }
        })
      })
    })
})

module.exports.studyWorker = studyWorker