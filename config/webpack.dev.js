const merge = require('webpack-merge')
const common = require('./webpack.common.js')
console.log(process.env.NODE_ENV)
module.exports = merge(common, {
    mode: 'development',
    devServer: {
        port: 9000,
        compress: true
    }
})