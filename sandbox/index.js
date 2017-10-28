const Sandbox = require('./sandbox')

const box = new Sandbox('./example', {
  blacklist: [],
  middleware: {
    isSafe (module, info) {
      return !info.isBlacklisted
    },
    require (module) {
      if (module === '@self') return this.wrap(this.file)
    }
  }
})
