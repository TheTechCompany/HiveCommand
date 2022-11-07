const fs = require('fs');
const path = require('path')

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
// const rewireTypescript = require('./rewire-ts');

module.exports = function override(config, env) {
    //do stuff with the webpack config...

    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false,
        },
    });

    config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));

    config.resolve.plugins.push(
        new TsconfigPathsPlugin()
    )

    // config.plugins.push(new BundleAnalyzerPlugin());

    config.resolve.alias = {
        ...config.resolve.alias,
        'react': path.resolve(__dirname, 'node_modules/react'),
        // "react/jsx-runtime.js": "react/jsx-runtime",
        // "react/jsx-dev-runtime.js": "react/jsx-dev-runtime",
        '@hexhive/ui': path.resolve(__dirname, 'node_modules/@hexhive/ui'),
        '@hexhive/utils': path.resolve(__dirname, 'node_modules/@hexhive/utils'),
        '@mui/icons-material': path.resolve(__dirname, 'node_modules/@mui/icons-material'),
        '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material'),
        'styled-components': path.resolve(__dirname, 'node_modules/styled-components'),
        'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
        '@emotion/react': path.resolve(__dirname, 'node_modules/@emotion/react'),
        '@hexhive/utils': path.resolve(__dirname, 'node_modules/@hexhive/utils'),
    }

    return config;
}