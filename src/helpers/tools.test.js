const {
  stringToLowerCase, returnFilesPath, returnErrorString, valueIstInArray,
} = require('./tools')
const path = require('path')

test('Concatenate array of name with a given path', () => {
  expect(returnFilesPath(['file1', 'file2'], '/path/to/file')).toEqual([path.join('/path/to/file', 'file1'), path.join('/path/to/file', 'file2')])
})

test('Turn string to lower case', () => {
  expect(stringToLowerCase('ABC')).toBe('abc')
})

test('It should throw a simple error', () => {
  function throwSimpleError() {
    returnErrorString('My simple error')
  }
  expect(throwSimpleError).toThrow('My simple error')
})

test('if value is in array', () => {
  expect(valueIstInArray(['a', 'b'], 'a')).toBe(true)
  expect(valueIstInArray(['a', 'b'], 'c')).toBe(false)
})
