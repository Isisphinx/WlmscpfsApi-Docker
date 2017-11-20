'use strict'

require('app-module-path').addPath(__dirname)

const app = require('express')()
const fs = require('fs')
const bodyParser = require('body-parser')
const path = require('path')

const redisConnection = require('config/redisConnection')
const rsmqConnection = require('config/rsmqConnection')
const { addStudiesQueue, pino } = require('config/constants')
const studyWorker = require('modules/studyWorker')

/*
TO DO
- Refactor purge worklist
- gracefully shutdown application on exit signal
*/

app.use(bodyParser.json())

require('modules/study')(app)
require('modules/worklist')(app)

// Initialize DB
const redisClient = redisConnection.redisClient
const rsmq = rsmqConnection.rsmq

app.get('/', (req, res) => {
  pino.debug('Http:Get /')
  res.send('Dicom Worklist is running...')
})

app.purge('/:WorklistName', (req, res) => {
  console.log('HTTP PURGE ' + req.params.WorklistName.toLowerCase())
  redisClient.sismember('worklist', req.params.WorklistName.toLowerCase(), (err, resp) => {
    if (err) throw err
    if (resp === 1) {
      const directory = 'worklistDir/' + req.params.WorklistName.toLowerCase()
      redisClient.keys(req.params.WorklistName.toLowerCase() + ':*', (err, keys) => {
        if (err) throw err
        keys.forEach(function (key) {
          redisClient.del(key)
        })
      })

      fs.readdir(directory, (err, files) => {
        if (err) throw error

        for (const file of files) {
          if (file !== 'lockfile') {
            fs.unlink(path.join(directory, file), (err) => {
              if (err) throw error
            })
          }
        }
        console.log('Worklist ' + req.params.WorklistName.toLowerCase() + ' purged')
      })
      res.send('OK')
    } else {
      console.log('Worklist ' + req.params.WorklistName.toLowerCase() + ' do not exist')
      res.sendStatus(404)
    }
  })
})

app.listen(8080, '0.0.0.0')