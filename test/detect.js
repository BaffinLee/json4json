/* eslint-env mocha */

const assert = require('assert')
const { detect, detectBlock, detectValue } = require('../src/detect')

describe('test detect.js', () => {
  it('should detect template string correctly', () => {
    const tpls = [
      {
        template: '{{a}}',
        type: 'value',
        optional: false,
        expression: 'a'
      },
      {
        template: '{{#? a.b}}',
        type: 'value',
        optional: true,
        expression: 'a.b'
      },
      {
        template: '{{#if c}}',
        type: 'if',
        optional: false,
        expression: 'c'
      },
      {
        template: '{{#elseif d}}',
        type: 'elseif',
        optional: false,
        expression: 'd'
      },
      {
        template: '{{#else}}',
        type: 'else',
        optional: false,
        expression: ''
      },
      {
        template: '{{#each arr}}',
        type: 'each',
        optional: false,
        expression: 'arr'
      },
      {
        template: '{{#merge}}',
        type: 'merge',
        optional: false,
        expression: ''
      },
      {
        template: '{{#concat}}',
        type: 'concat',
        optional: false,
        expression: ''
      },
      {
        template: '{{#let}}',
        type: 'let',
        optional: false,
        expression: ''
      }
    ]

    tpls.forEach(item => {
      const res = detect(item.template)
      assert(res.type === item.type)
      assert(res.optional === item.optional)
      assert(res.expression === item.expression)
    })

    let res = detect('string')
    assert(res === null)

    res = detect('{{}}')
    assert(res === null)
  })

  it('should detect value template correctly', () => {
    let res = detectValue('{{val}}')
    assert(res.type === 'value')
    assert(res.expression === 'val')
    assert(res.optional === false)

    res = detectValue('{{#? val}}')
    assert(res.type === 'value')
    assert(res.expression === 'val')
    assert(res.optional === true)

    res = detectValue({})
    assert(res === null)

    res = detectValue('something wrong')
    assert(res === null)

    res = detectValue('{{#if val}}')
    assert(res === null)
  })

  it('should detect logic block correctly', () => {
    const tpls = [
      {
        template: {
          '{{#if val}}': { a: 1 }
        },
        type: 'if',
        optional: false,
        expression: 'val',
        key: '{{#if val}}',
        data: { a: 1 }
      },
      {
        template: {
          '{{#elseif val2}}': { a: 2 }
        },
        type: 'elseif',
        optional: false,
        expression: 'val2',
        key: '{{#elseif val2}}',
        data: { a: 2 }
      },
      {
        template: {
          '{{#else}}': { a: 3 }
        },
        type: 'else',
        optional: false,
        expression: '',
        key: '{{#else}}',
        data: { a: 3 }
      },
      {
        template: {
          '{{#each val4}}': { a: 4 }
        },
        type: 'each',
        optional: false,
        expression: 'val4',
        key: '{{#each val4}}',
        data: { a: 4 }
      },
      {
        template: {
          '{{#merge}}': [ {a: 5}, {b: 5} ]
        },
        type: 'merge',
        optional: false,
        expression: '',
        key: '{{#merge}}',
        data: [ {a: 5}, {b: 5} ]
      },
      {
        template: {
          '{{#concat}}': [ {a: 6}, [ {b: 6} ] ]
        },
        type: 'concat',
        optional: false,
        expression: '',
        key: '{{#concat}}',
        data: [ {a: 6}, [ {b: 6} ] ]
      },
      {
        template: {
          '{{#let}}': [ {a: 7}, {} ]
        },
        type: 'let',
        optional: false,
        expression: '',
        key: '{{#let}}',
        data: [ {a: 7}, {} ]
      }
    ]

    tpls.forEach(item => {
      const res = detectBlock(item.template)
      assert(res.type === item.type)
      assert(res.optional === item.optional)
      assert(res.expression === item.expression)
      assert(res.key === item.key)
      assert(JSON.stringify(res.data) === JSON.stringify(item.data))
    })

    let res = detectBlock('{{val}}')
    assert(res === null)

    res = detectBlock('{{}}')
    assert(res === null)

    res = detectBlock('')
    assert(res === null)

    res = detectBlock({})
    assert(res === null)

    res = detectBlock({ '{{}}': 1 })
    assert(res === null)

    res = detectBlock({ '{{val}}': 2 })
    assert(res === null)

    res = detectBlock({ '{{#? val}}': 3 })
    assert(res === null)

    res = detectBlock(null)
    assert(res === null)
  })
})
