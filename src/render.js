const { detect, detectValue, detectBlock } = require('./detect')
const { pushPath, isPlainObject } = require('./utils')
const { validateLet, validateMerge, validateConcat } = require('./validate')
const evaluate = require('./evaluate')
const dropOptionalValue = Symbol.for('render.dropOptionalValue')
const renderers = {
  /**
   * value renderer
   * re: '{{ variable }}', '{{#? variable }}'
   * @param {string} template template
   * @param {object} options options
   * @param {Array} path path
   * @param {Context} ctx context
   * @param {object} tplInfo template infomation
   * @returns {string|symbol} value
   */
  value (template, options, path, ctx, tplInfo) {
    const context = ctx.get()
    try {
      const res = evaluate(tplInfo.expression, context)
      // drop optional value
      if (tplInfo.optional && !res) return dropOptionalValue
      // to string
      return Object.prototype.toString.call(res)
    } catch (e) {
      if (options.onError) options.onError(e.message, path, context)
      // return template itself if error
      return template
    }
  },
  /**
   * conditional statement renderer
   * re: { '{{#if condition1}}': {}, '{{#elseif condition2}}': {}, '{{#else}}': {} }
   * @param {object} template template
   * @param {object} options options
   * @param {Array} path path
   * @param {Context} ctx context
   * @param {object} tplInfo template infomation
   * @returns {any} value
   */
  if (template, options, path, ctx, tplInfo) {
    const context = ctx.get()
    const keys = Object.keys(template)
    const len = keys.length
    const testExpression = function (expression, path) {
      try {
        return !!evaluate(expression, context)
      } catch (e) {
        if (options.onError) options.onError(e.message, path, context)
        return false
      }
    }
    let result = null
    let tmpInfo = null
    let tmpPath = null

    // test conditions
    for (let i = 0; i < len; i++) {
      tmpInfo = detect(keys[i])
      tmpPath = pushPath(path, keys[i])

      if (!tmpInfo) {
        if (options.onError) options.onError('unrecognized key in conditional block', tmpPath, context)
        continue
      }

      if (tmpInfo.type === 'if') {
        // if statement should be first one
        if (i !== 0) {
          if (options.onError) options.onError('extra if statement in conditional block', tmpPath, context)
          continue
        }
        // if true
        if (testExpression(tmpInfo.expression, tmpPath)) {
          result = render(template[keys[i]], options, tmpPath, ctx)
          break
        }
      } else if (tmpInfo.type === 'elseif') {
        // elseif true
        if (testExpression(tmpInfo.expression, tmpPath)) {
          result = render(template[keys[i]], options, tmpPath, ctx)
          break
        }
      } else if (tmpInfo.type === 'else') {
        // else
        result = render(template[keys[i]], options, tmpPath, ctx)
      } else {
        if (options.onError) options.onError('unrecognized key in conditional block', tmpPath, context)
      }
    }

    return result
  },
  /**
   * elseif statement without if
   * re: { '{{#elseif condition2}}': {} }
   * @param {object} template template
   * @param {object} options options
   * @param {Array} path path
   * @param {Context} ctx context
   * @param {object} tplInfo template infomation
   * @returns {object} original template
   */
  elseif (template, options, path, ctx, tplInfo) {
    if (options.onError) options.onError('elseif should behind if', pushPath(path, tplInfo.key), ctx.get())
    return template
  },
  /**
   * else statement without if
   * re: { '{{#else}}': {} }
   * @param {object} template template
   * @param {object} options options
   * @param {Array} path path
   * @param {Context} ctx context
   * @param {object} tplInfo template infomation
   * @returns {object} original template
   */
  else (template, options, path, ctx, tplInfo) {
    if (options.onError) options.onError('else should behind if', pushPath(path, tplInfo.key), ctx.get())
    return template
  },
  /**
   * each statement renderer
   * re: { '{{#each array}}': {} }
   * @param {object} template template
   * @param {object} options options
   * @param {Array} path path
   * @param {Context} ctx context
   * @param {object} tplInfo template infomation
   * @returns {array} value
   */
  each (template, options, path, ctx, tplInfo) {
    let arr = null
    const res = []
    const context = ctx.get()

    // get array data to iterate
    try {
      arr = evaluate(tplInfo.expression, context)
      if (!Array.isArray(arr)) throw new Error('each statement should return an array')
    } catch (e) {
      if (options.onError) options.onError(e.message, path, context)
      return res
    }

    // each data compile with same template
    const newPath = pushPath(path, tplInfo.key)
    arr.forEach((item, index) => {
      // push item and $index to context
      if (!isPlainObject(item)) {
        if (options.onError) options.onError('data item in each should be plain object', newPath, context)
        ctx.push({ $index: index })
      } else {
        ctx.push(Object.assign({ $index: index }, item))
      }

      const val = render(tplInfo.data, options, newPath, ctx)
      if (val !== dropOptionalValue) res.push(val)

      // pop context
      ctx.pop()
    })

    return res
  },
  /**
   * concat statement renderer
   * re: { '{{#concat}}': [ {}, [], {} ] }
   * @param {object} template template
   * @param {object} options options
   * @param {Array} path path
   * @param {Context} ctx context
   * @param {object} tplInfo template infomation
   * @returns {array} value
   */
  concat (template, options, path, ctx, tplInfo) {
    const errmsg = validateConcat(tplInfo.data)
    if (errmsg) {
      if (options.onError) options.onError(errmsg, pushPath(path, tplInfo.key), ctx.get())
      return null
    }

    let res = []

    // concat every item in array
    tplInfo.data.forEach((item, index) => {
      const tmpPath = pushPath(path, tplInfo.key, index)
      const tmpData = render(item, options, tmpPath, ctx)

      if (tmpData === dropOptionalValue) return

      if (Array.isArray(tmpData)) res = res.concat(tmpData)
      else res.push(tmpData)
    })

    return res
  },
  /**
   * merge statement renderer
   * re: { '{{#merge}}': [ {}, {}, {} ] }
   * @param {object} template template
   * @param {object} options options
   * @param {Array} path path
   * @param {Context} ctx context
   * @param {object} tplInfo template infomation
   * @returns {object} value
   */
  merge (template, options, path, ctx, tplInfo) {
    const errmsg = validateMerge(tplInfo.data)
    if (errmsg) {
      if (options.onError) options.onError(errmsg, pushPath(path, tplInfo.key), ctx.get())
      return null
    }

    const res = {}

    // merge eveny object in array
    tplInfo.data.forEach((item, index) => {
      const tmpPath = pushPath(path, tplInfo.key, index)
      const tmpData = render(item, options, tmpPath, ctx)
      if (!isPlainObject(tmpData)) {
        if (options.onError) options.onError('item in merge block should be plain object', tmpPath, ctx.get())
        return
      }
      Object.assign(res, tmpData)
    })

    return res
  },
  /**
   * let statement renderer
   * re: { '{{#let}}': [ { variable1: '', variable2: '' }, {} ] }
   * @param {object} template template
   * @param {object} options options
   * @param {Array} path path
   * @param {Context} ctx context
   * @param {object} tplInfo template infomation
   * @returns {any} value
   */
  let (template, options, path, ctx, tplInfo) {
    const errmsg = validateLet(tplInfo.data)
    if (errmsg) {
      if (options.onError) options.onError(errmsg, pushPath(path, tplInfo.key), ctx.get())
      return null
    }

    // push local variables to context
    ctx.push(tplInfo.data[0])

    const newPath = pushPath(path, tplInfo.key, 1)
    const value = render(tplInfo.data[1], options, newPath, ctx)

    // pop context
    ctx.pop()

    return value
  }
}

/**
 * render template
 * @param {any} template template
 * @param {object} options options
 * @param {Array} path path
 * @param {Context} ctx context
 */
function render (template, options, path, ctx) {
  if (!template) return template

  let result = null
  let valueInfo = detectValue(template)
  let blockInfo = detectBlock(template, options.onError)

  // simple template
  if (valueInfo) {
    result = renderers.value(template, options, path, ctx, valueInfo)
  // logic block template
  } else if (blockInfo) {
    result = renderers[blockInfo.type](template, options, path, ctx, blockInfo)
  // not any template
  } else {
    // plain value
    if (typeof template !== 'object') {
      result = template
    // array
    } else if (Array.isArray(template)) {
      result = []
      template.forEach((item, index) => {
        const newPath = pushPath(path, index)
        const val = render(item, options, newPath, ctx)
        if (val === dropOptionalValue) return
        result.push(val)
      })
    // plain object
    } else if (isPlainObject(template)) {
      result = {}
      Object.keys(template).forEach(key => {
        const item = template[key]
        const newPath = pushPath(path, key)
        const tplInfo = detectValue(key)
        const value = render(item, options, newPath, ctx)
        if (value === dropOptionalValue) return
        // if key is template
        if (tplInfo) key = render(key, options, path, ctx)
        result[key] = value
      })
    // other object
    } else {
      result = template
    }
  }

  // if we got optional value in the very begining, return null
  if (result === dropOptionalValue && path.length === 0) return null

  return result
}

module.exports = render