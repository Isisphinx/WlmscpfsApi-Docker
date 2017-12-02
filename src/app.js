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

- Route function not with req res : make a function with parameters and switch of returned value for res
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

app.listen(8080, '0.0.0.0')