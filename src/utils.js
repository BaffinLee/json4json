/**
 * copy path and push key into it
 * @param {Array} path path
 * @param {string|number} key key
 */
function pushPath (path, key) {
  const newPath = path.slice()
  newPath.push(key)
  return newPath
}

module.exports = {
  pushPath
}
