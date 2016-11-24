require('./esHook.js').init({
	compile: true,
	polyfill: true,
	env: 'development',
	presets: ['es2015']
})
var app = require('./app.js')

function start() {
	app.init()
	app.start()
}
start()