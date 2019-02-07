const path = require('path')

module.exports = {
	mode: 'development',
	entry: './lib/game.js',
	output: {
		path: path.join(__dirname, 'public'),
		filename: 'game.bundle.js'
	},
	devtool: 'source-map'
}