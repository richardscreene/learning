const webpack = require("webpack");
const path = require("path");
const HWP = require("html-webpack-plugin");

module.exports = (env) => {
  return {
    entry: path.join(__dirname, "/src/index.js"),
    output: {
      filename: "build.js",
      path: path.join(__dirname, "/dist"),
      publicPath: "/"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader"
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"]
        }
      ]
    },
    plugins: [
      new HWP({ template: path.join(__dirname, "/src/index.html") }),
      new webpack.DefinePlugin({
        "process.env": {
          USER_API_URL: JSON.stringify(env.USER_API_URL)
        }
      })
    ],
    devServer: {
      hot: true,
      open: "Google Chrome",
      historyApiFallback: {
        index: "/"
      }
    }
  }
};
