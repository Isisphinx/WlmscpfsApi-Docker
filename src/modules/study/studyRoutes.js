const { createStudyInRedisAndSendToWorker } = require('./study')
const { pino } = require('config/constants')


/*
TO DO
- Delete study : delete file first then in db
*/

module.exports = (app) => {
  app.put('/:WorklistName/:StudyInstanceUID', (req, res) => { // Create or update study
    pino.info('put new study', req.body)
    createStudyInRedisAndSendToWorker(req, res)
  })

  app.delete('/:WorklistName/:StudyInstanceUID', (req, res) => { // Delete study

  })

}