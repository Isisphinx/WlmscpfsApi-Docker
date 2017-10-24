'use strict';

const app = require('express')();
const fs = require('fs');
const redis = require('redis');
const bodyParser = require('body-parser');
const RedisSMQ = require('rsmq');
const RSMQWorker = require("rsmq-worker");
const { spawn } = require('child_process');
const path = require('path');

app.use(bodyParser.json());

const redisClient = redis.createClient(6379, 'redis')
redisClient.on('error', (err)=> {
  console.log('Error ' + err);
});

const rsmq = new RedisSMQ({ client: redisClient, ns: "rsmq" });
rsmq.createQueue({ qname: "addStudies" }, (err, resp) => {
  if (resp === 1) {
    console.log("Created queue addStudies")
  }
});

const worker = new RSMQWorker("addStudies", { redis: redisClient, interval: [.2, 1, 3] });
worker.on("message", (msg, next, id) => {
  const msgJson = JSON.parse(msg);

  const dumpFile = `(0010,0010) PN ${msgJson.PatientName}
(0010,0020) LO ${msgJson.PatientID}
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
      if (err) throw err;
      console.log('Added to database study ' + msgJson.StudyInstanceUID + ' with ' + res + ' new keyes');
      fs.writeFile('processing/' + msgJson.StudyInstanceUID, dumpFile, (err) => {
        if (err) throw err;
        const dump2dcm = spawn('dump2dcm/dump2dcm', ['processing/' + msgJson.StudyInstanceUID, 'worklistDir/' + msgJson.WorklistName + '/' + msgJson.StudyInstanceUID + '.wl'], { 'env': { 'DCMDICTPATH': 'dump2dcm/dicom.dic' } });
        dump2dcm.stderr.on('data', (data) => {
        });
        dump2dcm.on('close', (code) => {
          if (code === 0) {
            fs.unlinkSync('processing/' + msgJson.StudyInstanceUID);
            redisClient.hset([msgJson.WorklistName + ':' + msgJson.StudyInstanceUID, 'status', 'done'], (err, res) => {
              if (err) throw err;
              next()
            })
          }
        });
      });
    });
});

// optional error listeners
worker.on('error', function (err, msg) {
  console.log("ERROR", err, msg.id);
});
worker.on('exceeded', function (msg) {
  console.log("EXCEEDED", msg.id);
});
worker.on('timeout', function (msg) {
  console.log("TIMEOUT", msg.id, msg.rc);
});

worker.start();

app.get('/', (req, res) => {
  res.send('IsisDicomWorklist is running...');
  console.log('HTTP GET /')
});

app.put('/:WorklistName/:StudyInstanceUID', (req, res) => {
  // Create or Replace a study and add it to queue
  redisClient.sismember('worklist', req.params.WorklistName.toLowerCase(), (err, resp) => {
    if (err) throw err;
    if (resp === 1) {
      req.body.WorklistName = req.params.WorklistName.toLowerCase();
      req.body.StudyInstanceUID = req.params.StudyInstanceUID

      rsmq.sendMessage({ qname: "addStudies", message: JSON.stringify(req.body) }, (err, resp) => {
        if (resp) {
        }
      });
      res.send('OK');
    } else {
      console.log('Worklist ' + req.params.WorklistName.toLowerCase() + ' not found')
      res.sendStatus(404);
    }
  })
});

app.put('/:WorklistName/', (req, res) => {
  console.log('HTTP PUT ' + req.params.WorklistName.toLowerCase())
  // Create worklist
  redisClient.sismember('worklist', req.params.WorklistName.toLowerCase(), (err, resp) => {
    if (err) throw err;
    if (resp === 0) {
      fs.mkdirSync('worklistDir/' + req.params.WorklistName.toLowerCase(), (err) => {
        if (err) throw err;
      })
      fs.writeFile('worklistDir/' + req.params.WorklistName.toLowerCase() + '/lockfile', '', (err) => {
        if (err) throw err;
      })
      redisClient.sadd(['worklist', req.params.WorklistName.toLowerCase()], (err, res) => {
        if (err) throw err;
      })
      console.log('Worklist ' + req.params.WorklistName.toLowerCase() + ' created')
      res.send('OK');
    } else {
      console.log('Worklist ' + req.params.WorklistName.toLowerCase() + ' exist already')
      res.sendStatus(409);
    }
  })
});

app.delete('/:WorklistName/:StudyInstanceUID', (req, res) => {
  console.log('HTTP DELETE ' + req.params.WorklistName.toLowerCase() + ':' + req.params.StudyInstanceUID)
  redisClient.exists(req.params.WorklistName.toLowerCase() + ':' + req.params.StudyInstanceUID, (err, resp) => {
    if (err) throw err;
    if (resp === 1) {
      console.log('del');

      fs.unlink('worklistDir/' + req.params.WorklistName.toLowerCase() + '/' + req.params.StudyInstanceUID + '.wl', (err) => {
        if (err) throw err;
        redisClient.del(req.params.WorklistName.toLowerCase() + ':' + req.params.StudyInstanceUID, (err, resp) => {
          if (err) throw err;
          res.send('OK');
        })
      })
    } else {
      res.sendStatus(404);
    }
  })
});

app.purge('/:WorklistName', (req, res) => {
  console.log('HTTP PURGE ' + req.params.WorklistName.toLowerCase())
  redisClient.sismember('worklist', req.params.WorklistName.toLowerCase(), (err, resp) => {
    if (err) throw err;
    if (resp === 1) {
      const directory = 'worklistDir/' + req.params.WorklistName.toLowerCase();
      redisClient.keys(req.params.WorklistName.toLowerCase()+':*',(err, keys)=>{
        if (err) throw err;
          keys.forEach(function (key) {
            redisClient.del(key);
        });
      });

      fs.readdir(directory, (err, files) => {
        if (err) throw error;

        for (const file of files) {
          if (file !== 'lockfile') {
            fs.unlink(path.join(directory, file), (err) => {
              if (err) throw error;
            });
          }
        }
        console.log('Worklist ' + req.params.WorklistName.toLowerCase() +' purged')
      });
      res.send('OK');
    } else {
      console.log('Worklist ' + req.params.WorklistName.toLowerCase() + ' do not exist')
      res.sendStatus(404);
    }
  })
})

app.listen(8080, '0.0.0.0');