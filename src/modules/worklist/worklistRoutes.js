/*
global rootRequire
*/

const { createWorklist, purgeWorklist } = require('./worklist')

const { pino } = rootRequire('config/constants')

module.exports = (app) => {
  app.put('/:WorklistName/', (req, res) => {
    pino.debug('Http:put to create a worklist', req.params)
    createWorklist(req, res)
  })

  app.purge('/:WorklistName', (req, res) => {
    purgeWorklist(req, res)
  })
}
