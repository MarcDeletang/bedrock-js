var _ = require('lodash')

module.exports = {
	init() {
		_.mixin({
			'replaceAll': function (str, from, to) {
				from = new RegExp(from, 'g')
				return str.replace(from, to)
			}
		})

		_.mixin({
			'indexOfObject': function (array, obj) {
				for (var i = 0; i != array.length; i++) {
					if (_.isEqual(array[i], obj))
						return i
				}
				return -1
			}
		})

		//Takes string, return bool, int, strings
		_.mixin({
			'getTypedValue': function (stringValue) {
				if (stringValue == 'true')
					return true
				if (stringValue == 'false')
					return false
				if (/^([0-9]+)[,|.]?([0-9]*)$/.test(stringValue))
					return parseFloat(stringValue)
				return stringValue
			}
		})

		//http://caolan.github.io/async/docs.html#.applyEachSeries (Didn't manage to make it work with lib)
		_.mixin({
			'applyEachSeries': function (callbacks, data) {
				//Javascript <3
				var that = {}
				that.callbacks = callbacks
				that.data = data
				return new Promise(
					function (resolve, reject) {
						that.resolve = resolve
						that.finalResults = []
						var next = function (finalResult) {
							if (that.callbacks.length == 0)
								resolve(that.finalResults)
							if (finalResult != null)
								that.finalResults.push(finalResult)
							var method = that.callbacks.shift()
							if (method)
								method(that.data, that.next)
						}
						that.next = next
						next()
					})
			}
		})

		//If object already has prop, does not bind
		_.mixin({
			'bindMethodsToObject': function (methods, model) {
				for (var methodName in methods) {
					if (!_.hasIn(model, methodName))
						model[methodName] = _.bind(methods[methodName], model)
				}
				return model
			}
		})

		_.mixin({
			'lowerFirstLetter': function (str) {
				return str.charAt(0).toUpperCase() + str.slice(1)
			}
		}),

		_.mixin({
			'upperFirstLetter': function (str) {
				return str.charAt(0).toUpperCase() + str.slice(1)
			}
		})

	}
}