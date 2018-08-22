# json4json

👻 Json template for json.

[![appveyor](https://ci.appveyor.com/api/projects/status/github/BaffinLee/json4json?branch=master&svg=true)](https://ci.appveyor.com/project/BaffinLee/json4json)
[![travis-ci](https://travis-ci.com/BaffinLee/json4json.svg?branch=master)](https://travis-ci.com/BaffinLee/json4json)
[![codecov](https://codecov.io/gh/BaffinLee/json4json/branch/master/graph/badge.svg)](https://codecov.io/gh/baffinlee/json4json)
[![npm](https://img.shields.io/npm/v/json4json.svg)](https://www.npmjs.com/package/json4json)
[![GitHub issues](https://img.shields.io/github/issues/BaffinLee/json4json.svg)](https://github.com/BaffinLee/json4json/issues)
[![license](https://img.shields.io/github/license/baffinlee/json4json.svg)](https://github.com/baffinlee/json4json)

> Inspired by [st.js](https://github.com/SelectTransform/st.js)

## Playground

[https://baffinlee.github.io/json4json/](https://baffinlee.github.io/json4json/)

## Install

```bash
npm install json4json
# or yarn
# yarn add json4json
```

## Usage

### general

> need Node.js >= 8

```javascript
const { transform } = require('json4json')
const template = '{{val}}'
const data = {val: 1}
const result = transform(template, data) // 1
```

### in web browser

> need `Symbol` and `new Function` support

```html
<script src="./dist/json4json.min.js"></script>
<script>
  const template = '{{val}}'
  const data = {val: 1}
  const result = json4json.transform(template, data) // 1
</script>
```

### full example

```javascript
const { transform } = require('json4json')

const template = {
  simpleValue: '{{value}}',
  optionalValue: '{{#? optionalValue}}',
  iteration: {
    object: {
      '{{#each object}}': ['{{$key}}', '{{$item.example}}', '{{keyInItem}}']
    },
    array: {
      '{{#each array}}': ['{{$key}}', '{{$item.example}}', '{{keyInItem}}']
    }
  },
  conditions: {
    '{{#if Math.round(num) === 10}}': 'if',
    '{{#elseif $root.num > 10}}': 'elseif',
    '{{#else}}': 'else'
  },
  mergeObjects: {
    '{{#merge}}': [
      { a: 1, b: 1, c: 1 },
      { b: 2, c: 2 },
      {
        '{{#if false}}': {},
        '{{#else}}': { c: 3 }
      }
    ]
  },
  concatArrays: {
    '{{#concat}}': [
      1,
      [2, 3],
      {
        '{{#each array}}': '{{$key + 4}}'
      },
      5
    ]
  },
  localVariables: {
    '{{#let}}': [
      {
        var1: 'val5',
        var2: 'val6'
      },
      ['{{var1}}', '{{var2}}']
    ]
  }
}

const data = {
  value: 'any value',
  optionalValue: false,
  object: {
    key1: {
      example: 'val1',
      keyInItem: 'val2'
    },
  },
  array: [
    {
      example: 'val3',
      keyInItem: 'val4'
    }
  ],
  num: 10.6
}

const result = transform(template, data)

/*
result = {
  simpleValue: 'any value',
  // optionalValue droped
  iteration: {
    object: [
      ['key1', 'val1', 'val2']
    ],
    array: [
      [0, 'val1', 'val2']
    ]
  },
  conditions: 'elseif',
  mergeObjects: {a: 1, b: 2, c: 3},
  concatArrays: [1, 2, 3, 4, 5],
  localVariables: ['val5', 'val6']
}
*/
```

### api

`transform(template, data, options)`

params:

- `template` {object | array | string}
- `data` {object} optional
- `options` {object} optional
- `options.onError` {function} optional, error handler

  params:

    - `message` {string} error message
    - `path` {array} template path where error occurs, like `['root', 'arr', 1, '{{#if val}}', 'key']`
    - `context` {object} data context at there, like `{$root: {}, val: '', $item: {}, $key: ''}`

return:

- {any}

## Syntax

> `$root` in the bottom of context represents the root data (object)

### value

`{{var}}` => any

example:

```javascript
const data = { key: 1 }
transform('{{key}}', data) // '1'
transform({ val: '{{key}}' }, data) // {val: '1'}
transform({ '{{key}}': 1 }, data) // {1: '1'}
```

### optional value

`{{#? var}}` => any | empty | null

example:

```javascript
const data = { key: 0 }
transform('{{#? key}}', data) // null
transform({ val: '{{#? key}}' }, data) // {}
transform({ '{{#? key}}': 1 }, data) // {}
transform([ '{{#? key}}' ], data) // []
```

### conditional statement

`{ '{{#if condition}}': '', '{{#if condition}}': '', '{{#else}}': '' }` => any

example:

```javascript
const data = { num: 10 }
transform({
  '{{#if num > 20}}': { a: 1 },
  '{{#elseif num > 10}}': [ 1 ],
  '{{#else}}': 1
}, data) // 1
```

### iteration

`{ '{{#each data}}': '' }` => array

> `$key` and `$item` will push to context, if `$item` is a plain object, all it's key will push to context

example:

```javascript
const arr = [ { itemKey: 'itemVal' } ]
const obj = { key: { itemKey: 'itemVal' } }

transform({
  '{{#each arr}}': {
    key: '{{$key}}',
    item: '{{$item.itemKey === itemKey}}',
    data: '{{itemKey}}'
  }
}, data) // [ { key: 0, item: true, data: 'itemVal' } ]

transform({
  '{{#each obj}}': {
    key: '{{$key}}',
    item: '{{$item.itemKey === itemKey}}',
    data: '{{itemKey}}'
  }
}, data) // [ { key: 'key', item: true, data: 'itemVal' } ]
```

### merge objects

> like `Object.assign`

`{ '{{#merge}}': [ { a: 1 }, { b: 2 } ] }` => object

example:

```javascript
const data = { val: 3 }
transform({
  '{{#merge}}': [
    { a: 1 },
    { b: 2, c: '{{val}}' }
  ]
}, data) // { a: 1, b: 2, c: 3 }
```

### concat arrays and items

`{ '{{#concat}}': [ 1, 2, [ 3, 4], 5 ] }` => array

example:

```javascript
const data = { val: 3 }
transform({
  '{{#concat}}': [
    1,
    [ 2, '{{val}}' ],
    {
      '{{#if val === 3}}': 4
    }
  ]
}, data) // [ 1, 2, 3, 4 ]
```

### local variables

`{ '{{#let}}': [ { localVar: 1 }, '{{localVar}}' ] }` => any

example:

```javascript
const data = { globalVar: 3 }

transform({
  '{{#let}}': [
    {
      localVar: 1
    },
    '{{globalVar + localVar}}'
  ]
}, data) // 4

transform({
  '{{#let}}': [
    {
      localVar: 1
    },
    {
      '{{#if localVar > globalVar}}': 2,
      '{{#else}}': 3
    }
  ]
}, data) // 3
```
