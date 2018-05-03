const webpack = require('webpack');
const path = require('path');
var nodeExternals = require('webpack-node-externals');

module.exports = {
  devtool: 'source-map',

  entry: {
    app: [
      './index.js',
    ],
  },
  target: 'electron-renderer',
  externals: [nodeExternals()],
  output: {
    path: __dirname,
    filename: 'index.out.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.css$/, use: ['style-loader', 'css-loader']}
    ]
  }
};
