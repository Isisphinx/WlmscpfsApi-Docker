const mock = require('mock-fs')

const { fs, deleteArrayOfFiles } = require('./promise')

beforeEach(() => {
  mock({
    file1: 'file contents',
    file2: 'file contents',
    file3: 'file contents',
  })
})
afterEach(() => {
  mock.restore()
})

test('deleting the files in array', () => {
  expect.assertions(3)
  return deleteArrayOfFiles(['file1', 'file2']).then((data) => {
    expect(data).toEqual(['file1', 'file2'])
    expect(fs.existsSync('file1')).toBe(false)
    expect(fs.existsSync('file3')).toBe(true)
  })
})

test('return files that failed to be deleted', () => {
  expect.assertions(1)
  return deleteArrayOfFiles(['file1', 'file4']).then((data) => {
    expect(data).toEqual(['file1', { err: 'file4' }])
  })
})
