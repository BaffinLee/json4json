/* eslint-env mocha */

const assert = require('assert')
const { validateLet, validateConcat, validateMerge } = require('../src/validate')

describe('test validate.js', () => {
  it('should validate let block', () => {
    let block = [
      {
        a: 1,
        b: 2
      },
      {}
    ]
    let res = validateLet(block)
    assert(res === '')

    block = null
    res = validateLet(block)
    assert(res.length > 0)

    block = {}
    res = validateLet(block)
    assert(res.length > 0)

    block = [new Date(), {}]
    res = validateLet(block)
    assert(res.length > 0)

    block = [[], {}]
    res = validateLet(block)
    assert(res.length > 0)

    block = [{}, {}, {}]
    res = validateLet(block)
    assert(res.length > 0)
  })

  it('should validate concat block', () => {
    let block = []
    let res = validateConcat(block)
    assert(res === '')

    block = {}
    res = validateConcat(block)
    assert(res.length > 0)

    block = ''
    res = validateConcat(block)
    assert(res.length > 0)

    block = { length: 1 }
    res = validateConcat(block)
    assert(res.length > 0)
  })

  it('should validate merge block', () => {
    let block = [{}, {}]
    let res = validateMerge(block)
    assert(res === '')

    block = {}
    res = validateMerge(block)
    assert(res.length > 0)

    block = []
    res = validateMerge(block)
    assert(res.length > 0)

    block = ''
    res = validateMerge(block)
    assert(res.length > 0)

    block = { length: 1 }
    res = validateMerge(block)
    assert(res.length > 0)
  })
})
