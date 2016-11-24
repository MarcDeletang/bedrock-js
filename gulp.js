var app = require('./middlewareHandler.js').expose()
var express = require('express')
var loader = require('gulp-task-loader')('tasks')
var _ = require('lodash')

module.exports = {

	init(bedrock) {
		var dirName = __dirname.substr(0, __dirname.lastIndexOf('/'))
		dirName = dirName + '/www'

		if (bedrock.config.bedrock.serveFiles == null)
			return bedrock.log.warn('Missing config in bedrock: serveFiles')

		if (bedrock.config.bedrock.serveFiles) {
			bedrock.log.info('Serving files in', dirName)
			app.use(express.static(dirName))
		} else {
			bedrock.log.info('No files served, API only')
		}
	},

	startJob(bedrock) {
		if (!bedrock.config.bedrock.watchAssets)
			return
		var gulp = null
		try {
			var gulp = require('../gulpfile.js')
		} catch (e) {
			bedrock.log.warn('No gulpfile found, cannot watch')
			return
		}
		if (gulp && _.isFunction(gulp.watch)) {
			gulp.compileAll()
			gulp.watch()
			bedrock.log.info('Watching assets folder')
		} else
			bedrock.log.warn('Gulpfile found, but no watch method exported')
	}
}