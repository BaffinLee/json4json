/**
 * detect template
 * @param {string} template template
 * @returns {object|null}
 */
function detect (template) {
  const baseReg = /^{{(.+)}}$/
  const typeReg = /^#(\?|each|if|elseif|else|concat|merge|let)(.*)$/i
  const base = baseReg.exec(template)
  if (!base) return null
  const type = typeReg.exec(base[1])
  return {
    type: (!type || type[1] === '?') ? 'value' : type[1].toLowerCase(),
    optional: !!(type && type[1] === '?'),
    expression: (type ? type[2] : base[1]).trim()
  }
}

/**
 * detect simple value template
 * @param {string} template template
 * @returns {object|null}
 */
function detectValue (template) {
  if (typeof template !== 'string') return null
  const tplInfo = detect(template)
  if (tplInfo && tplInfo.type !== 'value') return null
  return tplInfo
}

/**
 * detect logic block template
 * @param {string} template template
 * @param {function} onError error handler
 * @returns {object|null}
 */
function detectBlock (template, onError = null) {
  if (!template || typeof template !== 'object') return null
  const keys = Object.keys(template)
  if (keys.length === 0) return null
  const tplInfo = detect(keys[0])
  if (!tplInfo || tplInfo.type === 'value') return null
  return {
    ...tplInfo,
    key: keys[0],
    data: template[keys[0]]
  }
}

module.exports = {
  detect,
  detectValue,
  detectBlock
}
