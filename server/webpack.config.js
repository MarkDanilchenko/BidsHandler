// Webpack is used to bundle js and scss files for static greeting html page;

import path from "path";
import { fileURLToPath } from "url";

const absolutePath = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: {
    index: path.join(absolutePath, "/assets/js/index.js"),
  },
  output: {
    path: path.join(absolutePath, "/assets/dist"),
    filename: "bundle.js",
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
      },
    ],
  },
};
