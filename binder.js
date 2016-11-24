'use strict'
var _ = require('lodash')

//Return an array of routes:
//[{ path: '', controller : '', action '', policies: [func, func], target: func, middlewares: [] }]

var verbList = [
	'GET',
	'POST',
	'PUT',
	'PATCH',
	'DELETE',
	'HEAD',
]

module.exports = {


	getController(stack, controllerName, actionName) {
		for (var i = 0; i != stack.length; ++i) {
			if (stack[i].controller == controllerName && stack[i].action == actionName)
				return stack[i]
		}
		return null
	},

	getPolicyOrMiddleware(policies, name) {
		for (var pName in policies) {
			if (pName == name)
				return policies[pName]
		}
		return null
	},

	verifyBind(controllerStack, routeStack) {
		for (var i = 0; i != controllerStack.length; ++i) {
			if (!controllerStack[i].binded)
				Bedrock.log.warn('Missing binding controller ' + controllerStack[i].controller + ' ' + controllerStack[i].action)
		}
		for (var i = 0; i != routeStack.length; ++i) {
			if (!routeStack[i].binded)
				Bedrock.log.warn('Missing binding route ' + routeStack[i].path + ' to ' + routeStack[i].controller + ' ' + routeStack[i].action)
		}
	},



	//[{ path: '', controller : '', action '', policies: [func, func], target: func }]
	createFinalRoutes(controllerStack, routeStack, middlewares) {
		var bedRockStack = []
		for (var i = 0; i != routeStack.length; ++i) {
			var route = routeStack[i]

			var controller = this.getController(controllerStack, route.controller, route.action)
			if (controller == null) {
				Bedrock.log.warn('Tried to bind route ' + route.path + ' to an unknown controller: ' + route.controller + '.' + route.action)
				continue
			}
			var bedRoute = _.clone(controller)
			bedRoute.path = route.path
			bedRoute.verb = route.verb
			controller.binded = true
			route.binded = true
			bedRockStack.push(bedRoute)
		}
		this.verifyBind(controllerStack, routeStack)
		return bedRockStack
	},


	//Return [ { binded: bool, path: '/foo', verb:'GET', controller: 'Test', action: 'index' } ]
	createRouteStack(routes) {
		var res = []
		for (var r in routes) {
			//Remove useless spaces, convert tabs to space
			var path = _.replaceAll(_.trim(r), '\t', ' ')
			var verb = 'GET'
				//If verb found, fetch it
			if (_.indexOf(path, ' ') != -1) {
				verb = _.toUpper(_.trim(path.split(' ')[0]))
					//Invalid http verb
				if (_.indexOf(verbList, verb) == -1) {
					Bedrock.log.warn('Invalid verb ' + r + ' route ignored')
					continue
				}
				path = _.trim(path.split(' ')[1])
			}
			res.push({
				binded: false,
				path: path,
				controller: routes[r].substr(0, routes[r].lastIndexOf('.')),
				action: routes[r].substr(routes[r].lastIndexOf('.') + 1, routes[r].length - 1),
				verb: verb
			})
		}
		return res
	},

	//Return [ { binded: bool, controller: 'Test', action: 'index', method: func, policies: [], middlewares: [] } ]
	createControllerStack(controllers) {
		var res = []

		for (var c in controllers) {
			for (var actionName in controllers[c]) {
				res.push({
					binded: false,
					controller: c,
					action: actionName,
					method: _.bind(controllers[c][actionName], {
						getName: function () {
							return this.controllerName + '.' + this.actionName
						},
						controllerName: c,
						actionName: actionName
					}),
					policies: [],
					middlewares: []
				})
			}
		}
		return res
	},

	//Return [ { binded: bool, controller: 'Test', action: 'index', method: func, policies: [func, func], middlewares: [] } ]
	bindPoliciesToControllers(controllerStack, policies, policyConfig) {
		for (var controllerId in policyConfig) {

			var controller = this.getController(controllerStack, controllerId.substr(0, (controllerId.lastIndexOf('.'))),
				controllerId.substr(controllerId.lastIndexOf('.') + 1, controllerId.length - 1))

			//Check if controller is found
			if (controller == null) {
				Bedrock.log.warn('Policy bind failed (Controller not found): ' + controllerId)
				continue
			}
			//Policy can accept an array, iterate over it
			if (Array.isArray(policyConfig[controllerId])) {
				for (var i = 0; i != policyConfig[controllerId].length; ++i) {
					var policyMethod = this.getPolicyOrMiddleware(policies, policyConfig[controllerId][i])
					if (policyMethod != null)
						controller.policies.push(policyMethod)
					else
						Bedrock.log.warn('Policy bind found (Policy not found): ', policyConfig[controllerId][i])
				}
			} else {
				var policyMethod = this.getPolicyOrMiddleware(policies, policyConfig[controllerId])
				if (policyMethod != null)
					controller.policies.push(policyMethod)
				else
					Bedrock.log.warn('Policy bind found (Policy not found): ', policyConfig[controllerId])
			}
		}
		return controllerStack
	},

	addMiddlewares(routeStack, middlewares, middlewareConfig) {
		if (!middlewareConfig.custom) {
			if (Bedrock.verbose) {
				Bedrock.log.warn('Missing field custom in policy config')
				return routeStack
			}
		}
		for (var controllerId in middlewareConfig.custom) {
			var controllerName = controllerId.substr(0, controllerId.lastIndexOf('.'))
			var actionName = controllerId.substr(controllerId.lastIndexOf('.') + 1, controllerId.length - 1)
			var ctrl = this.getController(routeStack, controllerName, actionName)
			if (ctrl == null) {
				Bedrock.log.warn('Tried to bind middlewares to unknown controller: ' + controllerId)
				continue
			}
			//Middleware can accept an array, iterate over it
			if (Array.isArray(middlewareConfig.custom[controllerId])) {
				for (var i = 0; i != middlewareConfig.custom[controllerId].length; ++i) {
					var middlewareMethod = this.getPolicyOrMiddleware(middlewares, middlewareConfig.custom[controllerId][i])
					if (middlewareMethod != null)
						ctrl.middlewares.push(middlewareMethod)
					else
						Bedrock.log.warn('Middleware bind found (Middleware not found):', middlewareConfig.custom[controllerId][i])
				}
			} else {
				var middlewareMethod = this.getPolicyOrMiddleware(middlewares, middlewareConfig.custom[controllerId])
				if (middlewareMethod != null)
					ctrl.middlewares.push(middlewareMethod)
				else
					Bedrock.log.warn('Middleware bind found (Middleware not found): ', middlewareConfig.custom[controllerId])
			}

		}
		return routeStack
	}
}