/* eslint-env mocha */

const assert = require('assert')
const evaluate = require('../src/evaluate')

describe('test evaluate.js', () => {
  it('should evaluate js expression statement correctly', () => {
    let statement = 'a.b + c - 1'
    let context = { a: { b: 2 }, c: 4 }
    let res = evaluate(statement, context)
    assert(res === 5)

    statement = 'Math.ceil(a["b"])'
    context = { a: { b: 6.4 } }
    res = evaluate(statement, context)
    assert(res === 7)

    statement = 'a'
    context = { a: false }
    res = evaluate(statement, context)
    assert(res === false)

    statement = 'a === 1'
    context = { a: 1 }
    res = evaluate(statement, context)
    assert(res === true)

    statement = 'a ? 2 : (4 + 2)'
    context = { a: 0 }
    res = evaluate(statement, context)
    assert(res === 6)
  })
})
