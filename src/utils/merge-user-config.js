/*
|-------------------------------------------------------------------------------
| Merge User Configurations
|-------------------------------------------------------------------------------
|
| 1. Calls user middleware with our own config (babel, webpack, storybook's).
| 2. Defaults our own config against the user's config.
|
*/

const { identity, defaultsDeep, isFunction } = require('lodash');
const merge = require('webpack-merge');

const middlewareDefaults = {
  babel: identity,
  webpack: identity,
  storybook: {
    babel: identity,
    webpack: identity
  }
};

function mergeUserConfig (ourConfig) {
  const userConfig = require('src/utils/load-cli-config')();
  /*
  |-----------------------------------------------------------------------------
  | Default the values of the user's config to our own, making sure that the
  | middleware fields are default to identity first so that we don't inherit
  | our own middlewares.
  */
  const resolvingConfig = defaultsDeep(
    userConfig,
    middlewareDefaults,
    ourConfig
  );

  /*
  |-----------------------------------------------------------------------------
  | Handle the middleware configurations.
  |
  |  1. Try to call the middleware as a function, providing x config
  |  2. If not, try to merge the middleware as a webpack config
  */

  /*
  |---------------------------------------------------
  | Babel - taken from our defaults & user config.
  */
  resolvingConfig.babel = isFunction(resolvingConfig.babel)
    ? resolvingConfig.babel(ourConfig.babel())
    : merge(ourConfig.babel(), resolvingConfig.babel);

  /*
  |---------------------------------------------------
  |  Webpack
  |   - composes our "Babel"
  */
  const ourWebpackConfig = ourConfig.webpack({ babel: resolvingConfig.babel });
  resolvingConfig.webpack = isFunction(resolvingConfig.webpack)
    ? resolvingConfig.webpack(ourWebpackConfig)
    : merge(ourWebpackConfig, resolvingConfig.webpack);

  /*
  |---------------------------------------------------
  |  Storybook Babel
  |   - composes our resolved "Babel"
  */
  resolvingConfig.storybook.babel = isFunction(resolvingConfig.storybook.babel)
    ? resolvingConfig.storybook.babel(resolvingConfig.babel)
    : merge(resolvingConfig.babel, resolvingConfig.storybook.babel);

  /*
  |---------------------------------------------------
  |  Storybook Webpack
  |   - cannot be resolved NOW, so returns a function
  |   - storybook/webpack.config.js is then responsible for:
  |     1. getting our resolved "Webpack" from this merged config  object
  |     2. applying config transforms before passing the config back to this
  */
  const _originalStorybookWwebpack = resolvingConfig.storybook.webpack;
  resolvingConfig.storybook.webpack = storybookWebpack => {
    return isFunction(_originalStorybookWwebpack)
      ? _originalStorybookWwebpack(storybookWebpack)
      : merge(storybookWebpack, _originalStorybookWwebpack);
  };

  return resolvingConfig;
}

module.exports = mergeUserConfig;
