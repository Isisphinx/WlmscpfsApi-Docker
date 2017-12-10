/*
global rootRequire
*/

const path = require('path')
const app = require('express')()
const bodyParser = require('body-parser')

global.rootRequire = name => require(path.join(__dirname, name))

const { pino } = rootRequire('config/constants')

/*
TO DO
- ioredis using promised version
- Start listening when db connected stop if db disconnected
- Refactor purge worklist
- Gracefully shutdown application on exit signal
- Change promise to bluebird

- Route function make a function with parameters and switch of returned value for res
*/

app.use(bodyParser.json())

rootRequire('modules/study')(app)
rootRequire('modules/worklist')(app)

app.get('/', (req, res) => {
  pino.debug('Http:Get /')
  res.send('Dicom Worklist is running...')
})

app.listen(8080, '0.0.0.0')
