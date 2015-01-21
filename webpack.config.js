'use strict';
var webpack = require('webpack');

// Builds example bundles
module.exports = {
    context: __dirname,
    entry: {
      commons: ["lodash", "react", "react-treeview"],
      stateEditor: './examples/state-editor/index.js'
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].bundle.js",
        sourceMapFilename: "[file].map",
    },
    module: {
      loaders: [
        {test: /\.jsx?$/, exclude: /node_modules/, loader: '6to5-loader?experimental=true&runtime=true'},
        {test: /\.css?$/, loader: 'style!css!'}
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify('development')
        }
      }),
      new webpack.optimize.CommonsChunkPlugin(
        "commons", "commons.js"),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.ProvidePlugin({
        to5Runtime: "imports?global=>{}!exports-loader?global.to5Runtime!6to5/runtime"
      })
    ],
    resolve: {
      extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"],
      alias: {'react-json-editor': __dirname + '/index-dev.js'}
    }
};
