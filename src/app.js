'use strict'

require('app-module-path').addPath(__dirname)

const app = require('express')()
const fs = require('fs')
const bodyParser = require('body-parser')
const path = require('path')

const redisConnection = require('config/redisConnection')
const { pino } = require('config/constants')
const studyWorker = require('modules/studyWorker')

/*
TO DO
- ioredis using promised version
- Start listening when db connected stop if db disconnected
- Refactor purge worklist
- Gracefully shutdown application on exit signal
- Change promise to bluebird
*/

app.use(bodyParser.json())

require('modules/study')(app)
require('modules/worklist')(app)

// Initialize DB
const redisClient = redisConnection.redisClient

app.get('/', (req, res) => {
  pino.debug('Http:Get /')
  res.send('Dicom Worklist is running...')
})


// app.purge('/:WorklistName', (req, res) => {
//   console.log('HTTP PURGE ' + req.params.WorklistName.toLowerCase())
//   redisClient.sismember('worklist', req.params.WorklistName.toLowerCase(), (err, resp) => {
//     if (err) throw err
//     if (resp === 1) {
//       const directory = 'worklistDir/' + req.params.WorklistName.toLowerCase()
//       redisClient.keys(req.params.WorklistName.toLowerCase() + ':*', (err, keys) => {
//         if (err) throw err
//         keys.forEach(function (key) {
//           redisClient.del(key)
//         })
//       })

//       fs.readdir(directory, (err, files) => {
//         if (err) throw error

//         for (const file of files) {
//           if (file !== 'lockfile') {
//             fs.unlink(path.join(directory, file), (err) => {
//               if (err) throw error
//             })
//           }
//         }
//         console.log('Worklist ' + req.params.WorklistName.toLowerCase() + ' purged')
//       })
//       res.send('OK')
//     } else {
//       console.log('Worklist ' + req.params.WorklistName.toLowerCase() + ' do not exist')
//       res.sendStatus(404)
//     }
//   })
// })

app.listen(8080, '0.0.0.0')