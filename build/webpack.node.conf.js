var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};
// es5 style alternative
 fs.readdirSync(path.resolve(__dirname, '../node_modules'))
     .filter(function(x) {
         return ['.bin'].indexOf(x) === -1;
     })
     .forEach(function(mod) {
         nodeModules[mod] = 'commonjs ' + mod;
     });


module.exports = {
    mode: 'development',
    name: 'server',
    entry: './src/main.js',
    target: 'node',
    output: {
        path: path.join(__dirname, '../bin'),
        publicPath: 'bin/',
        filename: 'backend.js'
    },
    externals: nodeModules,
    module: {
        rules: [
            { test: /\.js$/, loader: ['babel-loader'] },
            { test:  /\.json$/, loader: 'json-loader' },
        ]
    },
    plugins: [
        new webpack.IgnorePlugin(/\.(css|less|scss)$/),
        new webpack.BannerPlugin({banner: 'require("source-map-support").install();', raw: true, entryOnly: false})
    ],
    devtool: 'sourcemap'
}