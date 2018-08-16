const Context = require('./context')
const render = require('./render')

/**
 * transform json template with data
 * @param {object|string} template template
 * @param {object} data data
 * @param {object} options options
 */
function transform (template, data = {}, options = {}) {
  const path = []
  const ctx = new Context(Object.assign({ $root: data }, data))
  return render(template, options, path, ctx)
}

module.exports = transform
