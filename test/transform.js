/* eslint-env mocha */

const assert = require('assert')
const { transform } = require('../index')

describe('test transform functional', () => {
  it('should apply default options', () => {
    const result = transform(['{{1 + 2}}', '{{a}}', '{{#? false}}'])
    assert(result[0] === 3)
    assert(result[1] === '{{a}}')
    assert(result.length === 2)
  })

  it('should transform value template', () => {
    const errors = []
    const result = transform({
      '{{a}}': [
        '{{b}}',
        '{{#? c}}',
        '{{error}}'
      ],
      d: '{{d.d - 1}}',
      e: '{{Math.floor(e)}}',
      f: '{{$root.f}}',
      g: '{{#? g}}',
      h: '{{#? h + 1}}',
      i: new Date()
    }, {
      a: 1,
      b: 2,
      c: false,
      d: { d: 5 },
      e: 3.2,
      f: new Date(),
      g: 0,
      h: 0
    }, {
      onError (message, path, context) {
        errors.push({
          message,
          path,
          context
        })
      }
    })

    assert('1' in result && Array.isArray(result['1']))
    assert(result['1'].length === 2)
    assert(result['1'][0] === 2)
    assert(result['1'][1] === '{{error}}')
    assert(errors.length === 1)
    assert(errors[0].message.indexOf('define') !== -1)
    assert(result.d === 4)
    assert(result.e === 3)
    assert(result.f instanceof Date)
    assert(('g' in result) === false)
    assert(result.h === 1)
    assert(result.i instanceof Date)

    const result2 = transform('{{#? a}}', {a: 0})
    assert(result2 === null)

    const result3 = transform('{{a}}', {a: 3})
    assert(result3 === 3)
  })

  it('should return original value when there is no template', () => {
    const cases = [
      {
        test: '',
        expect: ''
      },
      {
        test: 123,
        expect: 123
      },
      {
        test: null,
        expect: null
      },
      {
        test: undefined,
        expect: undefined
      }
    ]

    cases.forEach(item => {
      const result = transform(item.test)
      assert(result === item.expect)
    })

    const result = transform(new Date())
    assert(result instanceof Date)
  })

  it('should transform if block', () => {
    const errors = []
    const result = transform([
      {
        '{{#if a}}': 'a'
      },
      {
        '{{#if b}}': 'b',
        '{{#elseif !c}}': '!c',
        '{{#elseif c}}': 'c',
        '{{#else}}': 'd'
      },
      {
        '{{#if e}}': 'e',
        '{{#else}}': 'f'
      },
      {
        '{{#if c}}': 'c',
        '{{#else}}': 'd'
      },
      {
        '{{#if error}}': 'error1'
      },
      {
        '{{#elseif a}}': 'error2'
      },
      {
        '{{#else}}': 'error3'
      },
      {
        '{{#if a}}': 'a',
        '{{#if c}}': 'c',
        '{{#else}}': 'error4'
      },
      {
        '{{#if a}}': 'a',
        '{{error}}': 'error5'
      },
      {
        '{{#if a}}': 'a',
        'error': 'error6'
      },
      {
        '{{#if a}}': 'a',
        '{{#error}}': 'error7'
      }
    ], {
      a: false,
      b: false,
      c: true,
      e: false
    }, {
      onError (message, path, context) {
        errors.push({
          message,
          path,
          context
        })
      }
    })

    assert(result[0] === null)
    assert(result[1] === 'c')
    assert(result[2] === 'f')
    assert(result[3] === 'c')
    assert(result[4] === null)
    assert(result[5]['{{#elseif a}}'] === 'error2')
    assert(result[6]['{{#else}}'] === 'error3')
    assert(result[7] === 'error4')
    assert(result[8] === null)
    assert(result[9] === null)
    assert(result[10] === null)
    assert(errors.length === 7)
  })

  it('should transform each block', () => {
    const errors = []
    const result = transform([
      {
        '{{#each arr}}': ['{{$key}}', '{{$item}}']
      },
      {
        '{{#each obj}}': ['{{$key}}', '{{$item}}']
      },
      {
        '{{#each arr2}}': '{{#? a}}'
      },
      {
        '{{#each date}}': 'error1'
      },
      {
        '{{#each error}}': 'error2'
      }
    ], {
      arr: [2, 4, 6],
      obj: { 1: 2, 2: 4, 3: 6 },
      arr2: [
        {
          a: 0
        },
        {
          a: 1
        }
      ],
      date: new Date()
    }, {
      onError (message, path, context) {
        errors.push({
          message,
          path,
          context
        })
      }
    })
    let tmp = null

    tmp = result[0][1]
    assert(tmp[0] === 1 && tmp[1] === 4)

    tmp = result[1][2]
    assert(tmp[0] === '3' && tmp[1] === 6)

    tmp = result[2]
    assert(tmp.length === 1 && tmp[0] === 1)

    assert(errors.length === 2)
  })

  it('should transform concat block', () => {
    const result = transform({
      '{{#concat}}': [
        '{{#? a}}',
        '{{#? b}}',
        [2, 3, 4],
        {
          '{{#each arr}}': '{{$item}}'
        },
        8
      ]
    }, {
      a: 0,
      b: 1,
      arr: [5, 6, 7]
    })

    assert(result.length === 8)
    result.forEach((item, index) => {
      assert(item === index + 1)
    })

    const errors = []
    transform({ '{{#concat}}': 'error1' }, {}, {
      onError (message, path, context) {
        errors.push({
          message,
          path,
          context
        })
      }
    })

    assert(errors.length === 1)
  })

  it('should transform merge block', () => {
    const errors = []
    const result = transform({
      '{{#merge}}': [
        { a: 0, b: 2 },
        { c: 3 },
        { a: 1 },
        {
          '{{#if a}}': { d: 2 },
          '{{#elseif b > 1}}': { d: 3 },
          '{{#else}}': { d: 4 }
        },
        ['error1'],
        {
          '{{#each arr}}': 'error2'
        }
      ]
    }, {
      a: 0,
      b: 1,
      arr: [5, 6, 7]
    }, {
      onError (message, path, context) {
        errors.push({
          message,
          path,
          context
        })
      }
    })

    assert(result.a === 1)
    assert(result.b === 2)
    assert(result.c === 3)
    assert(result.d === 4)
    assert(errors.length === 2)

    const errors2 = []
    transform({ '{{#merge}}': 'error1' }, {}, {
      onError (message, path, context) {
        errors2.push({
          message,
          path,
          context
        })
      }
    })

    assert(errors2.length === 1)
  })

  it('should transform let block', () => {
    const errors = []
    const result = transform([
      {
        '{{#let}}': [
          {
            a: 0,
            b: 2,
            c: [3, 4, 5],
            d: new Date()
          },
          {
            a: '{{#? a}}',
            b: '{{b}}',
            c: {
              '{{#each c}}': '{{$item}}'
            },
            d: '{{d.getDate()}}',
            e: '{{e}}'
          }
        ]
      },
      {
        '{{#let}}': 'error1'
      }
    ], {
      b: 3,
      e: 6
    }, {
      onError (message, path, context) {
        errors.push({
          message,
          path,
          context
        })
      }
    })
    const res = result[0]

    assert(('a' in res) === false)
    assert(res.b === 2)
    assert(res.c.length === 3 && res.c[1] === 4)
    assert(res.d === (new Date()).getDate())
    assert(res.e === 6)
    assert(errors.length === 1)
  })
})
