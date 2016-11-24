var app = require('./middlewareHandler.js').expose()
var express = require('express')
var _ = require('lodash')

module.exports = {

	init(bedrock) {
		dirName = require('path').dirname(require.main.filename) + '/www'

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
			var gulp = require(require('path').dirname(require.main.filename) + '/gulpfile.js')
		} catch (e) {
			bedrock.log.warn('No gulpfile found, cannot watch', e)
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