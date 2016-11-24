var path = require('path'),
  sourceMapSupport = require('source-map-support'),
  babelRegisterCache = require('babel-register/lib/cache')
  //var config = bedrock.config.bedrock.compilation
  // If the hook has been deactivated, just return

var esFiles = [
  'bedrock-orm/index.js',
  'bedrock-orm/repository.js'
]

var allowCompileBedroc = function (filename) {
  for (var i = 0; i != esFiles.length; ++i) {
    if (filename.indexOf(esFiles[i]) != -1)
      return false
  }
  if (filename.indexOf('node_modules') == -1)
    return false
  return true
}

module.exports = {
  init: function (config) {
    config.ignore = allowCompileBedroc
    if (!config.compile) {
      console.log("Babel hook deactivated.")
    } else {
      if (config.env != 'production') {
        sourceMapSupport.install({
          retrieveSourceMap: function (file) {
            var cache = babelRegisterCache.get(),
              sourceMap = null
            Object.keys(cache).some(function (hash) {
              var fileCache = cache[hash]
              if (typeof fileCache == "undefined" || typeof fileCache.options == "undefined" || fileCache.options.filename != file)
                return false
              sourceMap = {
                url: file,
                map: fileCache.map
              }
              return true
            })
            return sourceMap
          }
        })
      }
      if (config.polyfill) {
        require("babel-polyfill")
      }
      delete config.polyfill
      delete config.compile
      require("babel-register")(config)
      console.log("Babel hook activated. Enjoy ES6/7 power in your app.")
    }
  }
}