'use strict'

require('./lodashExtend.js').init()
var winston = require('winston')
var middlewareHandler = require('./middlewareHandler.js')
var binder = require('./binder.js')
var serviceLoader = require('./serviceLoader.js')
var fileLoader = require('./fileLoader.js')
//var Orm = require('./orm/index.js')
var Orm = require('bedrock-orm')
var _ = require('lodash')
var gulp = require('./gulp.js')
var envLoader = require('./envLoader.js')

function Bedrock() {
	this.verbose = false

	this.log = new winston.Logger({
		transports: [new winston.transports.Console({
			colorize: true
		}), new winston.transports.File({
			filename: 'logs/errorfile.log',
			name: 'error',
			level: 'error',
			json: false,
			colorize: false
		}), new winston.transports.File({
			filename: 'logs/warnfile.log',
			name: 'warn',
			level: 'warn',
			json: false,
			colorize: false
		}), new winston.transports.File({
			filename: 'logs/infofile.log',
			name: 'info',
			level: 'info',
			json: false,
			colorize: false
		}), new winston.transports.File({
			filename: 'logs/debugfile.log',
			name: 'debug',
			level: 'debug',
			json: false,
			colorize: false
		})]
	})

	this.APIlog = new winston.Logger({
		transports: [new winston.transports.Console({
			colorize: true
		}), new winston.transports.File({
			filename: 'logs/APIerrorfile.log',
			name: 'error',
			level: 'error',
			json: false,
			colorize: false
		}), new winston.transports.File({
			filename: 'logs/APIwarnfile.log',
			name: 'warn',
			level: 'warn',
			json: false,
			colorize: false
		}), new winston.transports.File({
			filename: 'logs/APIinfofile.log',
			name: 'info',
			level: 'info',
			json: false,
			colorize: false
		}), new winston.transports.File({
			filename: 'logs/APIdebugfile.log',
			name: 'debug',
			level: 'debug',
			json: false,
			colorize: false
		})]
	})

	this.verboseLog = new winston.Logger({
		transports: [new winston.transports.Console({
			colorize: true
		}), new winston.transports.File({
			filename: 'logs/verboseinfofile.log',
			name: 'info',
			level: 'info',
			json: false,
			colorize: false
		}), new winston.transports.File({
			filename: 'logs/verbosedebugfile.log',
			name: 'debug',
			level: 'debug',
			json: false,
			colorize: false
		})]
	})
}

Bedrock.prototype.init = function () {
	try {
		this.config = {}

		var configs = fileLoader.loadConfigFolder()
		envLoader.loadEnv(this, configs)
			//console.log(configs)
		for (var t in configs) {
			this.config[t] = configs[t]
		}
		this.verbose = this.config.bedrock.verbose
		this.env = this.config.bedrock.env
		var services = fileLoader.loadServices()
		var models = fileLoader.loadModels()
		var policies = fileLoader.loadPolicies()
		var routes = fileLoader.loadRoutes()
		var controllers = fileLoader.loadControllers('./api/controllers/')
		var middlewares = fileLoader.loadMiddlewares()

		var policyConfig = fileLoader.loadPolicyConfig()
		var responses = fileLoader.loadResponses()
			//console.log('responses', responses)

		//console.log('controllers', controllers)
		//console.log('policyConfig', policyConfig)
		//console.log('policies', policies)
		if (this.config.bedrock.loadOrm == true) {
			this.orm = new Orm(this.config.connections.postgres, models, this)
			this.orm.init()
		}
		var controllerStack = binder.createControllerStack(controllers)

		//console.log('controllerStack', controllerStack)
		controllerStack = binder.bindPoliciesToControllers(controllerStack, policies, policyConfig)

		var routeStack = binder.createRouteStack(routes)
		var finalStack = binder.createFinalRoutes(controllerStack, routeStack, middlewares)
		finalStack = binder.addMiddlewares(finalStack, middlewares, this.config.middlewares)
		serviceLoader.load(services)
		middlewareHandler.setCORS(this)
		middlewareHandler.setDefault(this)
		middlewareHandler.loadCustomResponses(responses)
		middlewareHandler.setRouteStack(finalStack)
		gulp.init(this)
		gulp.startJob(this)
	} catch (e) {
		this.log.error('app.init', e)
	}
}

Bedrock.prototype.start = function () {
	this.log.info('App started')
	this.http = middlewareHandler.expose()
	middlewareHandler.start(this.config.bedrock.port)
}

var instance = new Bedrock()
global['Bedrock'] = instance
module.exports = instance