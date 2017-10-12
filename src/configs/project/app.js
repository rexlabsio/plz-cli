const _ = require('lodash');
const mergeUserConfig = require('src/utils/merge-user-config');
const baseConfig = require('src/configs/project/defaults/base');
const defaultConfig = require('src/configs/project/defaults/react-app');

const ourConfig = ({ isBaseOnly, isBuild, status, reload, output } = {}) =>
  _.defaultsDeep(
    {
      babel: () => require('src/configs/babel/babel.app')(),
      webpack: ({ babel } = {}) =>
        require('src/configs/webpack/webpack.app')({
          babel,
          isBaseOnly,
          isBuild,
          status,
          reload,
          output
        }),
      storybook: {
        babel: () => require('src/configs/babel/babel.app')(),
        webpack: ({ webpack } = {}) =>
          require('src/configs/webpack/webpack.storybook')({
            baseWebpack: webpack
          })
      }
    },
    defaultConfig,
    baseConfig
  );

module.exports = ({ isBaseOnly, isBuild, status, reload, output } = {}) =>
  mergeUserConfig(ourConfig({ isBaseOnly, isBuild, status, reload, output }));
