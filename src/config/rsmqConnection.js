const RedisSMQ = require('rsmq');
const redisConnection = require('./redisConnection');

const redisClient = redisConnection.redisClient;
module.exports.rsmq = new RedisSMQ({ client: redisClient, ns: "rsmq" });