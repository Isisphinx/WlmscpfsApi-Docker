const { stringToLowerCase, returnFilesPath } = require('./tools')
const path = require('path')

test('Turn string to lower case', () => {
  expect(stringToLowerCase('ABC')).toBe('abc')
})

test('Concatenate array of name with a given path', () => {
  expect(returnFilesPath(['123.txt', 'abc.js'], '/path/to/file')).toEqual([path.join('/path/to/file', '123.txt'), path.join('/path/to/file', 'abc.js')])
})