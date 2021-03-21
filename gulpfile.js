var gulp = require('gulp');
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;

var nodeModules = {};
fs.readdirSync(path.resolve(__dirname, 'node_modules'))
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });


var config = {
    mode: 'development',
    name: 'server',
    entry: ['./src/main.js'],
    target: 'node',
    output: {
        path: path.join(__dirname, '/bin'),
        publicPath: 'bin/',
        filename: 'backend.js'
    },
    externals: [
        nodeModules
    ],
    module: {
        rules: [
            { test: /\.jsx?$/, loader: 'babel-loader', },
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

function onBuild(cb) {
    return (err, stats) => {
        if (err) {
            console.log('Error', err);
        }
        else {
            console.log(stats.toString());
        }
        if (cb) {
            cb();
        }
    }
}

gulp.task('backend-build', function(cb) {
    webpack(config).run(onBuild(cb));
});

gulp.task('server', function (cb) {
    exec('node bin/backend.js', function (err, stdout, stderr) {
        cb(err);
    });
})

gulp.task('watch', function(cb) {
    webpack(config).watch(100, onBuild(cb));
})