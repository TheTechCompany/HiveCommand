const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const webpack = require('webpack')
const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = (webpackConfigEnv, argv) => {
  // webpackConfigEnv.analyze = true;
  const defaultConfig = singleSpaDefaults({
    orgName: "hivecommand-app",
    projectName: "frontend",
    webpackConfigEnv,
    argv,
  });

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    resolve: {
      alias: {
        '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material')
      },
      plugins: [
        new TsconfigPathsPlugin(),
      ],
      fallback: {
        https: false,
        http: false,
      }
    },
    module: {
      rules: [
        {
          test: /\.m?js/,
          resolve: {
              fullySpecified: false,
          },
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new webpack.EnvironmentPlugin({
        ...process.env,
        PUBLIC_URL: process.env.NODE_ENV == 'production' ? '/dashboard/command' : '/dashboard/hive-command'
      }), 
    ]
  });
};
