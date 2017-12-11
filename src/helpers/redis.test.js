// const Redis = require('ioredis-mock')
const { redisKeyWithNamespace, parseRedisKey } = require('./redis')

// const redis = new Redis({ redisHost, redisPort, data: { key: 'value' } })

test('return a redis key with nameSpace', () => {
  expect(redisKeyWithNamespace('namespace', 'key')).toBe('namespace:key')
})

test('parsing a redis key', () => {
  expect(parseRedisKey('namespace:key')).toEqual(['namespace', 'key'])
})
