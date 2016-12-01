'use strict'

var express = require('express')()
var bodyParser = require('body-parser')
var _ = require('lodash')

module.exports = {

	setCORS(bedrock) {
		if (bedrock.config.bedrock.cors == null)
			return bedrock.log.warn('Missing config in bedrock: cors')

		if (bedrock.config.bedrock.cors) {
			bedrock.log.info('CORS activated')
			express.use(function (req, res, next) {
				res.header("Access-Control-Allow-Origin", "*")
				res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
				res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, AccessToken")
				if (req.method == 'OPTIONS')
					return res.sendStatus(200)
				return next()
			})
		} else {
			if (bedrock.verbose)
				bedrock.log.info('CORS not activated')
		}
	},

	setDefault(bedrock) {
		express.set('view engine', 'ejs');
		express.disable('x-powered-by')
		express.use(function (req, res, next) {
			req.options = {}
			return next()
		})
		if (bedrock.config.middlewares && bedrock.config.middlewares.express && bedrock.config.middlewares.express.bodyParserJson == true) {
			if (bedrock.verbose)
				bedrock.log.info('Loaded bodyParserJson middleware')
			express.use(bodyParser.json({
				limit: '50mb'
			}))
		}
		if (bedrock.config.middlewares && bedrock.config.middlewares.express && bedrock.config.middlewares.express.bodyParserUrlencoded == true) {
			if (bedrock.verbose)
				bedrock.log.info('Loaded bodyParserUrlencoded middleware')
			express.use(bodyParser.urlencoded({
				extended: true
			}))
		}
		if (bedrock.config.middlewares && bedrock.config.middlewares.globals && _.isArray(bedrock.config.middlewares.globals)) {
			for (var i = 0; i != bedrock.config.middlewares.globals.length; ++i) {
				if (!_.isFunction(bedrock.config.middlewares.globals[i]))
					bedrock.log.warn('Invalid globalMiddlewares', i)
				else
					express.use(bedrock.config.middlewares.globals[i])
			}
		}
	},

	//routeStack
	//[{ path: '', controller : '', action '', policies: [func, func], method: func, middlewares: [func, func] }]
	setRouteStack(routeStack) {
		for (var i = 0; i != routeStack.length; ++i) {
			var route = routeStack[i]

			for (var j = 0; j != route.policies.length; ++j) {
				express[_.toLower(route.verb)](route.path, route.policies[j])
			}
			for (var j = 0; j != route.middlewares.length; ++j) {
				express[_.toLower(route.verb)](route.path, route.middlewares[j])
			}
			express[_.toLower(route.verb)](route.path, route.method)
		}
	},

	loadCustomResponses(responses) {
		for (var key in responses) {
			express.response[key] = responses[key]
		}
	},

	start(port) {
		Bedrock.log.info('Start listening', port)
		express.listen(port)
	},

	expose() {
		return express
	}
}