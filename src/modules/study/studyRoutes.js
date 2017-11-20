const { createStudyInRedisAndSendToWorker, deleteStudy } = require('./study')
const { pino } = require('config/constants')

module.exports = (app) => {
  
  app.put('/:WorklistName/:StudyInstanceUID', (req, res) => { // Create or update study
    pino.debug('Put new study',req.params, req.body)
    createStudyInRedisAndSendToWorker(req, res)
  })

  app.delete('/:WorklistName/:StudyInstanceUID', (req, res) => { // Delete study
    pino.debug('Delete study', req.params)
    deleteStudy(req, res)
  })

}