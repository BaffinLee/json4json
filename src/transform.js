const Context = require('./context')
const render = require('./render')

/**
 * transform json template with data
 * @param {object} template template
 * @param {object} data data
 * @param {object} options options
 */
function transform (template, data = {}, options = {}) {
  if (template === null || typeof template !== 'object') throw new Error('template should be json object')
  const ctx = new Context(Object.assign({ $root: data }, data))
  return render(template, options, [], ctx)
}

module.exports = transform
