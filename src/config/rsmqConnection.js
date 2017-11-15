const RedisSMQ = require('rsmq');

const redisConnection = require('config/redisConnection');
const constants = require('config/constants');
const tools = require('helpers/tools');

const redisClient = redisConnection.redisClient;
const rsmq = new RedisSMQ({ client: redisClient, ns: "rsmq" });
const addStudiesQueue = constants.addStudiesQueue

// Vérifier si la queu existe avant de créer
/*
rsmq.createQueue({ qname: addStudiesQueue }, (err, resp) => {
  if (err) tools.logToConsole(err, 'Error Creating Rsmq queue', addStudiesQueue);
  if (resp === 1) tools.logToConsole(addStudiesQueue, 'Rsmq queue created');
});
*/
module.exports.rsmq = rsmq;