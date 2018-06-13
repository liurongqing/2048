const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    context: path.resolve('./src'),
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name]_[hash:8].js',
        chunkFilename: '[name]_[hash:8].js'
    },
    module: {},
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            title: 'phaser-template'
        })
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    name: 'vendor'
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                    name: 'common'
                }
            }
        }
    }
}