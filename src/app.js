'use strict'

require('app-module-path').addPath(__dirname)

const app = require('express')()
const fs = require('fs')
const bodyParser = require('body-parser')
const path = require('path')

const redisConnection = require('config/redisConnection')
const rsmqConnection = require('config/rsmqConnection')
const tools = require('helpers/tools')
const constants = require('config/constants')

const studyWorker = require('modules/studyWorker')

app.use(bodyParser.json())

/*
Make the db theSource of thruth
asynchronous accepted : 202 Accepted
*/

// Initialize DB
const redisClient = redisConnection.redisClient
const rsmq = rsmqConnection.rsmq
const addStudiesQueue = constants.addStudiesQueue

app.get('/', (req, res) => {
  tools.logToConsole(req, 'get', '/')
  res.send('Dicom Worklist is running...')
})

app.put('/:WorklistName/:StudyInstanceUID', (req, res) => {
  // Create or Replace a study and add it to queue
  console.log(req.body)
  redisClient.sismember('worklist', req.params.WorklistName.toLowerCase(), (err, resp) => {
    if (err) throw err
    if (resp === 1) {
      req.body.WorklistName = req.params.WorklistName.toLowerCase()
      req.body.StudyInstanceUID = req.params.StudyInstanceUID

      rsmq.sendMessage({ qname: addStudiesQueue, message: JSON.stringify(req.body) }, (err, resp) => {
        if (err) tools.logToConsole(err, 'Error sending message', resp + ' ' + addStudiesQueue)
        if (resp) tools.logToConsole(resp, 'Message sent')
      })
      res.send('OK')
    } else {
      console.log('Worklist ' + req.params.WorklistName.toLowerCase() + ' not found')
      res.sendStatus(404)
    }
  })
})

app.put('/:WorklistName/', (req, res) => {
  console.log('HTTP PUT ' + req.params.WorklistName.toLowerCase())
  // Create worklist
  redisClient.sismember('worklist', req.params.WorklistName.toLowerCase(), (err, resp) => {
    if (err) throw err
    if (resp === 0) {
      fs.mkdirSync('worklistDir/' + req.params.WorklistName.toLowerCase(), (err) => {
        if (err) throw err
      })
      fs.writeFile('worklistDir/' + req.params.WorklistName.toLowerCase() + '/lockfile', '', (err) => {
        if (err) throw err
      })
      redisClient.sadd(['worklist', req.params.WorklistName.toLowerCase()], (err, res) => {
        if (err) throw err
      })
      console.log('Worklist ' + req.params.WorklistName.toLowerCase() + ' created')
      res.send('OK')
    } else {
      console.log('Worklist ' + req.params.WorklistName.toLowerCase() + ' exist already')
      res.sendStatus(409)
    }
  })
})

app.delete('/:WorklistName/:StudyInstanceUID', (req, res) => {
  console.log('HTTP DELETE ' + req.params.WorklistName.toLowerCase() + ':' + req.params.StudyInstanceUID)
  redisClient.exists(req.params.WorklistName.toLowerCase() + ':' + req.params.StudyInstanceUID, (err, resp) => {
    if (err) throw err
    if (resp === 1) {
      console.log('del')

      fs.unlink('worklistDir/' + req.params.WorklistName.toLowerCase() + '/' + req.params.StudyInstanceUID + '.wl', (err) => {
        if (err) throw err
        redisClient.del(req.params.WorklistName.toLowerCase() + ':' + req.params.StudyInstanceUID, (err, resp) => {
          if (err) throw err
          res.send('OK')
        })
      })
    } else {
      res.sendStatus(404)
    }
  })
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