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
    optional: type && type[1] === '?',
    expression: type ? type[2] : base[1]
  }
}

/**
 * detect simple value template
 * @param {string} template template
 * @returns {object|null}
 */
function detectValue (template) {
  const tplInfo = detect(template)
  return tplInfo ? (tplInfo.type === 'value' ? tplInfo : null) : null
}

/**
 * detect logic block template
 * @param {string} template template
 * @returns {object|null}
 */
function detectBlock (template) {
  if (!template || typeof template !== 'object') return null
  const keys = Object.keys(template)
  if (keys.length === 0) return null
  const tplInfo = detect(keys[0])
  return tplInfo ? (tplInfo.type !== 'value' ? tplInfo : null) : null
}

module.exports = {
  detect,
  detectValue,
  detectBlock
}
