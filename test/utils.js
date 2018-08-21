/* eslint-env mocha */

const assert = require('assert')
const { pushPath, isPlainObject } = require('../src/utils')

describe('test utils.js', () => {
  it('should pushPath correctly', () => {
    let path = []
    let newPath = pushPath(path, 2, 3)
    assert(newPath !== path)
    assert(newPath.length === 2)
    assert(newPath[0] === 2)
    assert(newPath[1] === 3)

    path = [1, 2, 3, 4]
    newPath = pushPath(path, 5)
    assert(newPath !== path)
    assert(newPath.length === 5)
    assert(newPath[4] === 5)
  })

  it('should detect plain object correctly', () => {
    const cases = [
      {
        obj: {},
        res: true
      },
      {
        obj: [],
        res: false
      },
      {
        obj: 'dsad',
        res: false
      },
      {
        obj: 1,
        res: false
      },
      {
        obj: null,
        res: false
      },
      {
        obj: Object.create({}),
        res: true
      },
      {
        obj: Object.create(null),
        res: true
      },
      {
        obj: new (class a extends Object {})(),
        res: false
      },
      {
        obj: new Date(),
        res: false
      },
      {
        obj: Object(),
        res: true
      },
      {
        obj: new Object(), // eslint-disable-line no-new-object
        res: true
      }
    ]

    cases.forEach(item => {
      const res = isPlainObject(item.obj)
      assert(res === item.res)
    })
  })
})
