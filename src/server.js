/*
global rootRequire
*/

const path = require('path')

global.rootRequire = name => require(path.join(__dirname, name))

const { pino } = rootRequire('config/constants')
const app = require('./app')

/*
TO DO
- Start listening when db connected stop if db disconnected
*/

app.listen(8080, '0.0.0.0', () => {
  pino.info('App listening on port 3000')
})
