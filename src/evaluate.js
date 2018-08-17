/**
 * evaluate javascript expression in context
 * @param {string} expression javascript expression
 * @param {object} context context
 */
function evaluate (expression, context) {
  const func = new Function('context', `with(context){ return ${expression} }`) // eslint-disable-line no-new-func
  return func(context)
}

module.exports = evaluate
