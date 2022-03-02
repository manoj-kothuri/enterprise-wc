const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const demoEntry = require('./scripts/webpack-dev-entry');
const WebpackHtmlExamples = require('./scripts/webpack-html-templates');

const isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production';

module.exports = {
  entry: () => demoEntry(),
  output: {
    chunkFormat: 'module',
    path: path.resolve(__dirname, './build/development'),
    filename: '[name]/[name].[contenthash].js',
    assetModuleFilename: '[path][name][contenthash][ext]',
    clean: true,
    publicPath: '/'
  },
  mode: isProduction ? 'production' : 'development',
  optimization: {
    splitChunks: {
      chunks: 'async'
    },
  },
  infrastructureLogging: {
    level: 'error' // or 'verbose' if any debug info is needed
  },
  devServer: {
    hot: false,
    liveReload: false,
    port: 4300,
    devMiddleware: {
      writeToDisk: true,
    },
    static: {
      directory: path.resolve(__dirname, `./build/demos/${isProduction ? 'production' : 'development'}`),
      watch: false
    }
  },
  devtool: 'cheap-source-map',
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|json|css)$/i,
        exclude: [/node_modules/],
        type: 'asset/resource',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            // Options are all in babel.config.js
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.scss$/,
        exclude: [
          /node_modules/,
          path.resolve(__dirname, 'build')
        ],
        use: [
          'sass-to-string',
          {
            loader: 'sass-loader',
          }
        ],
      },
      {
        test: /\.scss$/,
        exclude: [
          /node_modules/,
          path.resolve(__dirname, 'src')
        ],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              attributes: {
                id: 'demo-styles',
                nonce: '0a59a005' // @TODO needs to match a global nonce instance
              }
            }
          },
          'css-loader',
          'sass-loader',
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      // verbose: true, // For debugging un-comment this
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.npm_lifecycle_event === 'build:dev:stats' ? 'server' : 'disabled',
      reportFilename: 'dev-build-report.html'
    }),
  ].concat(WebpackHtmlExamples)
};
