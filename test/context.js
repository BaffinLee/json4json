/* eslint-env mocha */

const assert = require('assert')
const Context = require('../src/context')

describe('test context.js', () => {
  it('should get right context', () => {
    let ctx = new Context({ a: 1, b: 1, c: 1 })
    let tmp = null

    ctx.push({ a: 2, b: 2 })
    ctx.push({ c: 3 })
    ctx.push({ b: 4 })
    tmp = ctx.get()
    assert(tmp.a === 2)
    assert(tmp.b === 4)
    assert(tmp.c === 3)

    ctx.pop()
    tmp = ctx.get()
    assert(tmp.b === 2)

    ctx.pop()
    tmp = ctx.get()
    assert(tmp.c === 1)

    assert(ctx.get() === tmp)

    ctx = new Context()
    ctx.push({ a: 2, b: 3 })
    ctx.push({ b: 4 })
    tmp = ctx.get()
    assert(tmp.a === 2)
    assert(tmp.b === 4)
    assert(tmp.c === undefined)
  })
})
