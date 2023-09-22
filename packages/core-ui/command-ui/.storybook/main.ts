import { join, resolve, dirname } from "path";
import TsconfigPathsPlugins from 'tsconfig-paths-webpack-plugin'
/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}

/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-webpack5"),
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  webpackFinal: async (config) => {
    // config.resolve.
    // config.module
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [{
        loader: require.resolve('ts-loader'),
        options: {
          projectReferences: true
        }
      }],

      exclude: [/node_modules/, resolve(__dirname + '/../stories/')]
    })

    config.resolve.plugins = [new TsconfigPathsPlugins()];
    console.log(config.module.rules[2])
    return config;
  }
};
export default config;
