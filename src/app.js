const app = require('express')()
const bodyParser = require('body-parser')

const { pino } = require('./config/constants')

/*
TO DO
- ioredis using promised version
- Refactor purge worklist
- Change promise to bluebird
- Route function make a function with parameters and switch of returned value for res
- change to koa
*/

app.use(bodyParser.json())

require('./modules/study')(app)
require('./modules/worklist')(app)

app.get('/', (req, res) => {
  pino.debug('Http:Get /')
  res.send('Dicom Worklist is running...')
})
module.exports = app
