const fs = require('fs-extra')
const path = require('path')
const utils = require('./utils')

exports.watching = {}

exports._themes = []

exports.add = function (dir) {
  this._themes.push(dir)
}

exports.remove = function (dir) {
  const index = this._themes.indexOf(dir)
  const exists = index >= 0

  if (!exists) {
    return
  }

  this.close(dir)
  this._themes.splice(index, 1)
}

exports.close = function (dir) {
  dir = utils.getFullPath(dir)

  if (!this.watching[dir]) {
    return
  }

  this.watching[dir].close()
  delete this.watching[dir]
}

exports._handle = async function (dir, event, name) {
  const location = path.join(dir, name)
  const exists = await fs.pathExists(location)

  if (!exists) {
    return this.remove(location)
  }

  const state = await fs.lstat(location)
  const isDir = state.isDirectory()

  if (!isDir) {
    return
  }

  this.add(location)
}

exports.watch = function (dir) {
  dir = utils.getFullPath(dir)

  const alreadyWatching = this.watching[dir]

  if (alreadyWatching) {
    return
  }

  const watcher = fs.watch(dir, { recursive: true }, this._handle.bind(this, dir))
  this.watching[dir] = watcher

  return {
    close: this.close.bind(this, dir)
  }
}
