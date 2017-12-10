const { createStudy, deleteStudy } = require('./study')

const { pino } = require('../../config/constants')

module.exports = (app) => {
  app.put('/:WorklistName/:StudyInstanceUID', (req, res) => { // Create or update study
    pino.debug('Http:put to create a study', req.params, req.body)
    createStudy(req, res)
  })

  app.delete('/:WorklistName/:StudyInstanceUID', (req, res) => { // Delete study
    pino.debug('Http:delete to delete a study', req.params)
    deleteStudy(req, res)
  })
}
