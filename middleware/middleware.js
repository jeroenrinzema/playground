/**
 * This variable stores all middleware events and their listening callbacks.
 * @type {Object}
 */
exports.events = {}

/**
 * These constructors are used to determine what type of callback function is given.
 * @type {Object}
 */
exports.constructors = {
  AsyncFunction: (async function () {}).constructor,
  GeneratorFunction: (function* () {}).constructor
}

/**
 * Return a set of methods custom for the given event and callback.
 * @param  {String}   event    Name of the event.
 * @param  {Function} callback Callback function that is used.
 * @return {Object}            Object containing usefull methods for the given callback.
 */
exports._methods = function (event, callback) {
  return {
    unset: this.unset.bind(this, event, callback) // Bind the scope and default arguments to the 'unset' method
  }
}

/**
 * This function can be used to let the given callback listen for the given event.
 * The passed callback function could be a generator, async or sync function.
 * To stop listening to the event could the 'unset' method inside the scope be called.
 * @param  {String}   event    The name of the event that should be listened to.
 * @param  {Function} callback The callback function that should be called when the event is fired.
 */
exports.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = []
  }

  this.events[event].push(callback)

  return this._methods(event, callback)
}

/**
 * This function stops a callback function from listening to a event.
 * @param  {String}   event    Name of the event where the callback is listening on.
 * @param  {Function} callback The exact callback function that is also given to the 'on' or 'once' method.
 */
exports.unset = function (event, callback) {
  for (let index in this.events[event]) {
    const listner = this.events[event][index]

    if (listner === callback) {
      this.events[event].splice(index, 1)
    }
  }
}

/**
 * This handle function calles the given callback and waits untill it is done.
 * @param  {Function} callback   The callback to be called. This could be a generator, async or sync function.
 * @param  {Object}   [scope={}] The scope that should be bound to the callback
 * @param  {Array}    [args=[]]  The arguments that should be passed to the callback.
 */
exports.handle = async function (callback, scope = {}, args = []) {
  const {AsyncFunction, GeneratorFunction} = this.constructors

  switch (callback.constructor) {
    case GeneratorFunction:
      const generator = callback.apply(scope, args)
      for (let promise of generator) {
        if (promise instanceof Promise) {
          const resolved = await promise
          generator.next(resolved)
        }
      }
      break
    case AsyncFunction:
      await callback.apply(scope, args)
      break
    default:
      callback.apply(scope, args)
  }
}

/**
 * Call the given event listeners. The event listeners can modify the given arguments and scope.
 * @param  {String} event      The event name that should be called.
 * @param  {Array}  [args=[]]  The arguments that need to be passed to the listeners.
 * @param  {Object} [scope={}] The scope that needs to be bound to the listeners.
 * @return {Array}             [args, scope] The args and scope are returned when all listeners are called.
 */
exports.call = async function (event, args = [], scope = {}) {
  if (!this.events[event]) {
    return
  }

  if (!Array.isArray(args)) {
    args = [args]
  }

  for (let callback of this.events[event]) {
    scope = Object.assign(scope, this._methods(event, callback))
    await this.handle(callback, scope, args)
  }

  return [args, scope]
}
