const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const webpack = require('webpack')
const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = (webpackConfigEnv, argv) => {
  // webpackConfigEnv.analyze = true;
  const defaultConfig = singleSpaDefaults({
    orgName: "hivecommand-app",
    projectName: "frontend",
    webpackConfigEnv,
    argv,
  });

  console.log(defaultConfig.output);

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    // entry: {
    //   // 'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
    //   // 'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
    //   // 'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
    //   // 'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
    //   // 'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker'
    // },  
    // output: {
    //   globalObject: 'self',
    //   filename: '[name].bundle.js',
    //   path: path.resolve(__dirname, 'dist')
    // },
    resolve: {
      alias: {
        'react-resize-aware': path.resolve(__dirname, 'node_modules/react-resize-aware'),
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
        },
        {
          test: /\.ttf$/,
          use: ['file-loader']
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
      new MonacoWebpackPlugin({
        languages: ['typescript', 'javascript', 'css']
      })
    ]
  });
};
