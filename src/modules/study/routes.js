/*
Route in external file :
app.js

var express = require('express');
var app = express();
require('./routes')(app);
*/



module.exports = (app) => { // PUT study
  app.get('/:WorklistName/:StudyInstanceUID', (req, res) => {

  })

  app.delete('/:WorklistName/:StudyInstanceUID', (req, res) => { // DELETE study

  })

}

