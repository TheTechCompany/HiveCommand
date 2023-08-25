const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const webpack = require('webpack')
const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
    optimization: {
      usedExports: true
    },

    resolve: {
      alias: {
        typescript: path.resolve(__dirname, 'node_modules/typescript'),
      // },
      // alias: {
        'react-resize-aware': path.resolve(__dirname, '../../../node_modules/react-resize-aware'),
      // //   '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material'),
      // //   "@mui/x-date-pickers": path.resolve(__dirname, 'node_modules/@mui/x-date-pickers'),
      // //   '@mui/icons-material': path.resolve(__dirname, 'node_modules/@mui/icons-material'),

      //   react: path.resolve(__dirname, '../../../node_modules/react'),
      //   '@hexhive/ui': path.resolve(__dirname, '../../../node_modules/@hexhive/ui'),
      //   '@hexhive/utils': path.resolve(__dirname, '../../../node_modules/@hexhive/utils'),
      //   '@hexhive/styles': path.resolve(__dirname, '../../../node_modules/@hexhive/styles'),
      //   "@mui/x-date-pickers": path.resolve(__dirname, '../../../node_modules/@mui/x-date-pickers'),
      //   // '@mui/icons-material': path.resolve(__dirname, 'node_modules/@mui/icons-material'),
      //   '@mui/material': path.resolve(__dirname, '../../../node_modules/@mui/material'),
      //   'styled-components': path.resolve(__dirname, '../../../node_modules/styled-components'),
      //   'react-router-dom': path.resolve(__dirname, '../../../node_modules/react-router-dom'),
      //   '@emotion/react': path.resolve(__dirname, '../../../node_modules/@emotion/react')
      },
      plugins: [
        new TsconfigPathsPlugin(),
      ],
      fallback: {
        // https: false,
        // http: false,
        // "module": false,
        // "pnpapi": false,
        "path": require.resolve('path-browserify'),
        "buffer": require.resolve('buffer/'),
        "stream": require.resolve('stream'),
        "crypto": require.resolve('crypto-browserify')
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
        },
        {
          test: /\.tsx?$/,
          exclude: /src/,
          loader: 'ts-loader',
          options: { projectReferences: true },
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
        languages: ['typescript']
      }),
      // new BundleAnalyzerPlugin()
    ]
  });
};
