const fs = require('fs');

const TsConfigPaths = require('tsconfig-paths-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
// const rewireTypescript = require('./rewire-ts');

module.exports = function override(config, env) {
    //do stuff with the webpack config...

    // config = rewireTypescript(config, env);

    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false,
        },
    });

    // config.module.rules.push({
    //     test: /\.(ts|tsx)$/,
    //     loader: 'ts-loader',
    //     options: {
    //       transpileOnly: true,
    //       projectReferences: true
    //     }
    //   })

    // const tsLoader = {
    //     test: /\.(js|mjs|jsx|ts|tsx)$/,
    //     // include: paths.appSrc,
    //     loader: require.resolve('ts-loader'),
    //     options: { transpileOnly: true },
    //   };

    //   const { isAdded: tsLoaderIsAdded } = addAfterLoader(
    //     config,
    //     loaderByName('url-loader'),
    //     tsLoader
    //   );

    // config.resolve.extensions.push('.tsx')

    config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));

    config.resolve.plugins.push(new TsConfigPaths({extensions: ['.ts', '.tsx']}))

    // fs.writeFileSync(__dirname + '/webpack.log', JSON.stringify(config))
    // console.log({config})

    return config;
}