const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const webapckBaseConfig = require('./webpack.base.conf');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = merge(webapckBaseConfig, {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    main: path.resolve(__dirname, '../src/source/script.ts'),
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: './assets',
            },
          },
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: './assets',
            },
          },
        ],
      },
    ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './../src/views/script.html'),
      filename: 'index.html',
      inject: true,
    }),
  ],
  devServer: {
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    port: 8000,
    hot: true,
    host: 'localhost',
  },
});
