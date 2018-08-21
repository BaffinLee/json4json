const Context = require('./context')
const render = require('./render')
const defaultOptions = {
  onError () {}
}

/**
 * transform json template with data
 * @param {string|object} template template
 * @param {object} [data] data
 * @param {object} [options] options
 * @param {function} [options.onError] error handler
 */
function transform (template, data = {}, options = {}) {
  const ctx = new Context(Object.assign({ $root: data }, data))
  const opts = Object.assign({}, defaultOptions, options)
  return render(template, opts, [], ctx)
}

module.exports = transform
