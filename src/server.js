const app = require('./app')

const { pino, appPort } = require('./config/constants')

/*
TO DO
- Start listening when db connected stop if db disconnected
- Gracefully shutdown application on exit signal
*/

app.listen(appPort, () => {
  pino.info(`App listening on port ${appPort}`)
})
