const path = require('path')

exports.getFullPath = function (dir, Module = module.parent) {
  const [char] = dir
  const isFullPath = char === '/'

  const parent = path.dirname(Module.parent.filename)
  const fullPath = isFullPath ? dir : path.join(parent, dir) // Join parent and dir when no full path is given

  return fullPath
}
