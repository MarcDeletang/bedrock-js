'use strict'

var fs = require('fs')
var _ = require('lodash')


var basePath = 'api/'

module.exports = {
	isJsFile(fileName) {
		return _.endsWith(fileName, '.js')
	},

	loadServices() {
		try {
			var services = {}
			var files = fs.readdirSync('./api/services')
			for (var i = 0; i != files.length; ++i) {
				var fileName = files[i]
				if (this.isJsFile(fileName)) {
					var req = require('../api/services/' + fileName)
					services[fileName.slice(0, fileName.length - 3)] = req
				}
			}
			return services
		} catch (e) {
			Bedrock.log.error('fileLoader.loadServices', e)
		}
	},

	loadPolicies() {
		try {
			var policies = {}
			var files = fs.readdirSync('./api/policies')
			for (var i = 0; i != files.length; ++i) {
				var fileName = files[i]
				if (this.isJsFile(fileName)) {
					var req = require('../api/policies/' + fileName)
					policies[fileName.slice(0, fileName.length - 3)] = req
				}
			}
			return policies
		} catch (e) {
			Bedrock.log.error('fileLoader.loadPolicies', e)
		}
	},

	loadModels() {
		try {
			var models = {}
			var files = fs.readdirSync('./api/models')
			for (var i = 0; i != files.length; ++i) {
				var fileName = files[i]
				if (this.isJsFile(fileName)) {
					var req = require('../api/models/' + fileName)
					models[fileName.slice(0, fileName.length - 3)] = req
				}
			}
			return models
		} catch (e) {
			Bedrock.log.error('fileLoader.loadModels', e)
		}
	},

	loadRoutes() {
		try {
			return require('../api/config/routes.js')
		} catch (e) {
			Bedrock.log.error('fileLoader.loadRoutes', e)
		}
	},

	loadControllers(path) {
		try {
			var controllers = {}
			var files = fs.readdirSync(path)
			for (var i = 0; i != files.length; ++i) {
				var fileName = files[i]
				if (this.isJsFile(fileName)) {
					var req = require('.' + path + fileName)
					var searchName = path.replace('./api/controllers/', '')
					searchName = searchName.replace('/', '.')
					searchName = searchName + fileName.slice(0, fileName.length - 3)
					controllers[searchName] = req
				} else {
					var stat = fs.statSync(path + fileName)
					if (stat.isDirectory()) {
						controllers = _.merge(controllers, this.loadControllers(path + fileName + '/'))
					}
				}
			}
			return controllers
		} catch (e) {
			Bedrock.log.error('fileLoader.loadControllers', e)
		}
	},

	loadPolicyConfig() {
		try {
			return require('../api/config/policies.js')
		} catch (e) {
			Bedrock.log.error('fileLoader.loadPolicyConfig', e)
		}
	},


	loadConfigFolder() {
		try {
			var configs = {}
			var files = fs.readdirSync('./api/config')
			for (var i = 0; i != files.length; ++i) {
				var fileName = files[i]
				if (this.isJsFile(fileName)) {
					var req = require('../api/config/' + fileName)
					configs[fileName.slice(0, fileName.length - 3)] = req
				}
			}
			return configs
		} catch (e) {
			Bedrock.log.error('fileLoader.loadConfigFolder', e)
		}
	},

	loadResponses() {
		try {
			var responses = {}
			var files = fs.readdirSync('./api/responses')
			for (var i = 0; i != files.length; ++i) {
				var fileName = files[i]
				if (this.isJsFile(fileName)) {
					var req = require('../api/responses/' + fileName)
					responses[fileName.slice(0, fileName.length - 3)] = req
				}
			}
			return responses
		} catch (e) {
			Bedrock.log.error('fileLoader.loadResponses', e)
		}
	},

	loadMiddlewares() {
		try {
			var responses = {}
			var files = fs.readdirSync('./api/middlewares')
			for (var i = 0; i != files.length; ++i) {
				var fileName = files[i]
				if (this.isJsFile(fileName)) {
					var req = require('../api/middlewares/' + fileName)
					responses[fileName.slice(0, fileName.length - 3)] = req
				}
			}
			return responses
		} catch (e) {
			Bedrock.log.error('fileLoader.loadMiddlewares', e)
		}
	}
}