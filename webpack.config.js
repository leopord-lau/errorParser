const TerserPlugin = require("terser-webpack-plugin");
module.exports = {
  mode: "production",
  entry: "./index.js",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            arguments: true,
          },
          toplevel: true,
        },
      }),
    ],
  },
};
