const path = require('path')
global.rootRequire = function (name) {
  return require(path.join(__dirname, '..', name))
}

const mock = require('mock-fs')
const { fs, deleteArrayOfFiles } = rootRequire('helpers/promise')

beforeEach(() => {
  mock({
    'file1': 'file contents',
    'file2': 'file contents'
  })
})
afterEach(() => {
  mock.restore()
})

test('the data is peanut butter', () => {
  expect.assertions(1);
  return deleteArrayOfFiles(['file1', 'file2']).then(data => {
    expect(data).toBe(['file1', 'file2']);
  });
});