const redis = require('redis');

module.exports.redisClient = redis.createClient(6379, 'redis');



