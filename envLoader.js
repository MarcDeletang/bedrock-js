var start = 'BEDROCK_'
var _ = require('lodash')

module.exports = {
	loadEnv(bedrock, config) {
		var env = process.env

		for (var envName in env) {
			if (this.isBedrockVar(envName)) {
				var pathArray = this.getPathArray(envName)
				var pathParent = _.initial(pathArray)

				var configValue = _.get(config, pathArray)
				var parentValue = _.get(config, pathParent)

				if (_.isObject(parentValue) && !configValue) {
					bedrock.log.info('Load var from env:', 'bedrock.' + _.join(pathArray, '.'))
					//bedrock.log.info('typed:', _.getTypedValue(env[envName]), typeof (_.getTypedValue(env[envName])), envName)
					_.set(config, pathArray, _.getTypedValue(env[envName]))
				} else
					bedrock.log.warn('Env loaded but not set', envName)
			}
		}
	},

	getPathArray(variableName) {
		return _.filter(variableName.replace(start, '').split('_'), function (elem) {
			if (elem.length != 0)
				return elem
		})
	},

	isBedrockVar(variableName) {
		if (variableName.toUpperCase().startsWith(start))
			return true
		else
			return false
	}
}