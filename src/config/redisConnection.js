const redis = require('redis');

const tools = require('helpers/tools');

const redisClient = redis.createClient(6379, 'redis');

redisClient.on('connect', function () {
    tools.logToConsole('Connected', 'Redis Client')
});
redisClient.on('error', (err) => {
    tools.logToConsole(err, 'Redis Connection Error')
});

module.exports.redisClient = redisClient