var _ = require('lodash')

module.exports = {

	init() {
		_.mixin({
			'replaceAll': function (str, from, to) {
				from = new RegExp(from, 'g')
				return str.replace(from, to)
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

	}
}