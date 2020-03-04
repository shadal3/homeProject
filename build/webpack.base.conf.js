const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
//we appeal to package.json to take plugins and register them in plugins part below
const path = require('path');


const PATHS = {
    src: path.join(__dirname, '../src'),
    dist: path.join(__dirname, '../dist'),
    assets: 'assets/'
};

module.exports = {

    externals: {
        paths: PATHS
    },
    entry: {
        app: PATHS.src
    },
    output: {
        filename: `${PATHS.assets}js/[name].[chunkhash].js`,
        path: PATHS.dist,
        publicPath: '/'
        //create .dist folder in root of a project
        //path: path.resolve(__dirname, './dist'),
        //publicPath: './dist'
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    name: 'vendors',
                    chunks: 'all',
                    enforce: true
                }
            }
        }
    },
    module: {
        rules: [
            {
                resolve: {
                    alias: {
                        '~': 'src' //  ~/components/react.react
                    }
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]'
                }
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                loader: "file-loader",
                options: {
                    name: '[name].[ext]' //ext we take from test, name is app (refers to entry - app)
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
                        options: {sourceMap : true, config: {path: './postcss.config.js'}}
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
                        options: {sourceMap : true, config: {path: `./postcss.config.js`}}
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: `${PATHS.src}/index.html`, //from
            filename: "./index.html", // where
            inject: true // Inject css, scripts and etc automatically into index.html
        }),
        new MiniCssExtractPlugin({
            filename: `${PATHS.assets}css/[name].[contenthash].css`,
        }),
        new CopyWebpackPlugin([
            {from: `${PATHS.src}/${PATHS.assets}/img`, to: `${PATHS.assets}img`},
            {from: `${PATHS.src}/${PATHS.assets}/fonts`, to: `${PATHS.assets}fonts`},
            {from: `${PATHS.src}/static`, to: 'static'},

        ])
    ]
};