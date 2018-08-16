const { detect, detectValue, detectBlock } = require('./detect')
const { pushPath } = require('./utils')
const evaluate = require('./evaluate')
const renderers = {
  value (expression, optional, ctx) {

  },
  if (template, ctx) {

  },
  elseif (template, ctx) {

  },
  else (template, ctx) {

  },
  each (template, ctx) {

  },
  concat (template, ctx) {

  },
  merge (template, ctx) {

  },
  let (template, ctx) {

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
  let blockInfo = detectBlock(template)

  // simple template
  if (valueInfo) {
    result = renderers.value(valueInfo.expression, valueInfo.optional, ctx)
  // logic block template
  } else if (blockInfo) {
    result = renderers[blockInfo.type](template, ctx)
  // not template
  } else {
    // plain value
    if (typeof template !== 'object') {
      result = template
    // array
    } else if (Array.isArray(template)) {
      result = []
      template.forEach((item, index) => {
        const newPath = pushPath(path, index)
        result.push(render(item, options, newPath, ctx))
      })
    // object
    } else {
      result = {}
      Object.keys(template).forEach(key => {
        const item = template[key]
        const newPath = pushPath(path, key)
        result[key] = render(item, options, newPath, ctx)
      })
    }
  }
}

module.exports = render
