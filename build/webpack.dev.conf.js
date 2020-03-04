const webpack = require('webpack');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');

const devWebpackConfig = merge(baseWebpackConfig, {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        port: 8080,
        contentBase: baseWebpackConfig.externals.paths.dist, //where webpack will be opened
        // displays warning and errors on the screen not in the console
        overlay: {
          warning: true,
          errors: true
      }
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map'
        })
    ]
});

module.exports = new Promise((resolve, reject) => {
   resolve(devWebpackConfig);
});
