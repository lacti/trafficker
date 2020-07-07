/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  context: __dirname,
  mode: process.env.NODE_ENV === "development" ? "development" : "production",
  entry: path.join(__dirname, "src", "main.ts"),
  devtool:
    process.env.NODE_ENV === "development"
      ? "cheap-module-eval-source-map"
      : "source-map",
  resolve: {
    extensions: [".mjs", ".json", ".ts", ".js"],
    symlinks: false,
    cacheWithContext: false,
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  target: "node",
  node: {
    __filename: true,
    __dirname: true,
  },
  module: {
    rules: [
      {
        test: /\.(tsx?)$/,
        loader: "ts-loader",
        exclude: [
          [
            path.resolve(__dirname, "node_modules"),
            path.resolve(__dirname, ".webpack"),
          ],
        ],
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
    ],
  },
};
