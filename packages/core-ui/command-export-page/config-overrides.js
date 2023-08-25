/* config-overrides.js */
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = function override(config, env) {

    //do stuff with the webpack config...
    config.resolve = {
        ...config.resolve,
        plugins: [...(config.resolve.plugins || []), new TsconfigPathsPlugin()]
    }

    return config;

}