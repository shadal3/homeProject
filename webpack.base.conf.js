const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//appeal to package.json to take them and register them plugins part below
const path = require('path');

module.exports = {
    entry: {
        app: './src/index.js'
    },
    output: {
        filename: '[name].js',
        //create .dist folder in root of a project
        path: path.resolve(__dirname, './dist'),
        //publicPath: './dist'
    },
    module: {
        rules: [
            /*{
                test: /\.html$/,
                use: {
                        loader: "html-loader",
                        options: {minimize: true}
                }
            },*/
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: {
                    loader: "file-loader"
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: { sourceMap: true}
                    }, {
                        loader: 'postcss-loader',
                        options: {sourceMap : true, config: {path: 'src/js/postcss.config.js'}}
                    }

                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {sourceMap : true},
                    }, {
                        loader: 'sass-loader',
                        options: {sourceMap : true},
                    },{
                        loader: 'postcss-loader',
                        options: {sourceMap : true, config: {path: 'src/js/postcss.config.js'}}
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./index.html",
            filename: "./index.html"
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css"
        })
    ]
};