/*
Route in external file
app.js

var express = require('express');
var app = express();
require('./routes')(app);
*/

/*
Put study : put study in db then worker to convert to file [1]
put study multiple procedure step : multiple file
delete study : delte file first then in db
*/

module.exports = (app) => {
  // PUT study
  app.get('/:WorklistName/:StudyInstanceUID', (req, res) => {

  })

  // DELETE study
  app.delete('/:WorklistName/:StudyInstanceUID', (req, res) => {

  })

}

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