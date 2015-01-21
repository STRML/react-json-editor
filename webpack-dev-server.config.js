var webpack = require("webpack");

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
        {test: /\.jsx?$/, exclude: /node_modules/, loader: '6to5-loader?experimental=true'},
        {test: /\.jsx$/, exclude: /node_modules/, loader: 'react-hot-loader'}
      ]
    },
    plugins: [
      new webpack.optimize.DedupePlugin(),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify('development')
        }
      }),
    ],
    debug: true,
    devtool: "#inline-source-map",
    publicPath: '/examples/',
    resolve: {
      extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"],
      alias: {
        'react-grid-layout': __dirname + '/index-dev.js'
      }
    }
};
