const STACK = Symbol.for('Context.STACK')
const CTX = Symbol.for('Context.CTX')

/**
 * context
 */
class Context {
  /**
   * constructor
   * @param {object|null} data data
   */
  constructor (data = {}) {
    this[CTX] = null
    this[STACK] = [ data ]
  }

  /**
   * push context into top
   * @param {object} data data
   */
  push (data) {
    this[CTX] = null
    this[STACK].push(data)
  }

  /**
   * pop out top context
   * @returns {object|null}
   */
  pop () {
    this[CTX] = null
    return this[STACK].pop()
  }

  /**
   * get current context
   * @returns {object}
   */
  get () {
    if (!this[CTX]) this[CTX] = this[STACK].reduce((prev, curr) => Object.assign(prev, curr), {})
    return this[CTX]
  }
}

module.exports = Context
