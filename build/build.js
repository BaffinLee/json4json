const path = require('path')

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, './entry.js'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'json4json.min.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        options: {
          presets: ["env", "stage-3"]
        }
      }
    ]
  },
  devtool: false
}
