/* config-overrides.js */
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');

module.exports = function override(config, env) {

    //do stuff with the webpack config...
    console.log(config.resolve.plugins)
    config.resolve = {
        ...config.resolve,
        plugins: [new TsconfigPathsPlugin()],
        alias: {
            reactflow: path.resolve(__dirname, '../../../node_modules/reactflow'),
        }
    }

    return config;

}