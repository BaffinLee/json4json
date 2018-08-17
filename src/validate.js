const { isPlainObject } = require('./utils')

/**
 * validate let block
 * @param {any} data data
 * @returns {string} error message
 */
function validateLet (data) {
  if (!Array.isArray(data)) return 'let block should be array'
  if (data.length !== 2) return 'let block should be array with two items'
  if (!isPlainObject(data[0])) return 'variables declare statement in let block should be plain object'
  return ''
}

/**
 * validate merge block
 * @param {any} data data
 * @returns {string} error message
 */
function validateMerge (data) {
  if (!Array.isArray(data)) return 'merge block should be array'
  if (data.length === 0) return 'merge block should not be empty array'
  return ''
}

/**
 * validate concat block
 * @param {any} data data
 * @returns {string} error message
 */
function validateConcat (data) {
  if (!Array.isArray(data)) return 'concat block should be array'
  return ''
}

module.exports = {
  validateLet,
  validateMerge,
  validateConcat
}
