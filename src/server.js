const path = require('path')

global.base = path.join(__dirname, '/')

const { pino } = require('./config/constants')

const app = require('./app')

/*
TO DO
- Start listening when db connected stop if db disconnected
- Gracefully shutdown application on exit signal
*/

app.listen(8080, '0.0.0.0', () => {
  pino.info('App listening on port 3000')
})
