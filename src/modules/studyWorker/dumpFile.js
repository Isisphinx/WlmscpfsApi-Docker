const { spawn } = require('child_process')

module.exports.returnDump = json => // Return the dump file data
  `(0010,0010) PN ${json.PatientName}
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


module.exports.convertDumpToWorklistFile = dumpFile => // Convert dump file to a dicom worklist file
  new Promise((resolve, reject) => {
    const dcmFile = `${dumpFile}.wl`
    let stderr = ''
    const dump2dcm = spawn('dump2dcm/dump2dcm', ['+te', dumpFile, dcmFile], { env: { DCMDICTPATH: 'dump2dcm/dicom.dic' } })
    dump2dcm.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    dump2dcm.on('close', (code) => {
      if (code !== 0) {
        reject(stderr)
        return
      }
      resolve(dcmFile)
    })
  })
