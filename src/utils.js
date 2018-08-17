/**
 * copy path and push key into it
 * @param {Array} path path
 * @param {string|number} rest key
 */
function pushPath (path, ...rest) {
  const newPath = path.slice()
  newPath.push(...rest)
  return newPath
}

/**
 * check an object is plain object or not
 * @param {object} obj object to detect
 */
function isPlainObject (obj) {
  if (obj === null || typeof obj !== 'object') return false
  return obj.constructor === Object || Object.getPrototypeOf(obj) === null
}

module.exports = {
  pushPath,
  isPlainObject
}
