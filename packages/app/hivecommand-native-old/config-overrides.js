const webpack = require("webpack");

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const path = require("path");

module.exports = function override(config, env) {
  config.resolve.fallback = {
//     url: require.resolve("url"),
//     assert: require.resolve("assert"),
//     crypto: require.resolve("crypto-browserify"),
//     http: require.resolve("stream-http"),
//     https: require.resolve("https-browserify"),
//     os: require.resolve("os-browserify/browser"),
    buffer: false // require.resolve("buffer"),
//     stream: require.resolve("stream-browserify"),
//     process: require.resolve("process"),
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    })
  );

  config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));

  config.resolve.plugins.push(
    new TsconfigPathsPlugin({extensions: ['.ts', '.tsx']})
  )


  config.resolve.extensions.push('.tsx')
//   config.stats = { ...config.stats, children: true };

  // react-dnd
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false, // disable the behaviour
    },
  });

//   config.module.rules.push({test: /\.tsx?$/, use: [{loader: 'ts-loader', options: {transpileOnly: true}}]})

  // react-dnd
  config.resolve.alias = {
    ...config.resolve.alias,
    'react': path.resolve(__dirname, 'node_modules/react'),
    "react/jsx-runtime.js": "react/jsx-runtime",
    "react/jsx-dev-runtime.js": "react/jsx-dev-runtime",
  };

//   console.log({resolve: config.resolve})

  return config;
};