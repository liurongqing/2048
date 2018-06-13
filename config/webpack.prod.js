const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path')

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new CleanWebpackPlugin(['./dist'], { root: path.resolve(__dirname, '../'), verbose: true }),
        new UglifyJsPlugin({
            exclude: /\/node_modules/,
            uglifyOptions: {
                warnings: false,
                output: {
                    comments: false
                }
            }
        })
    ]

})