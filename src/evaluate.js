/**
 * evaluate javascript expression in context
 * @param {string} expression javascript expression
 * @param {Context} ctx context
 */
function evaluate (expression, ctx) {
  const context = ctx.get()
  const func = new Function('context', `with(context){ return ${expression} }`) // eslint-disable-line no-new-func
  return func(context)
}

module.exports = evaluate
