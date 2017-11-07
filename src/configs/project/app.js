const _ = require('lodash');
const mergeUserConfig = require('../../utils/merge-user-config');
const baseConfig = require('../../configs/project/defaults/base');
const defaultConfig = require('../../configs/project/defaults/react-app');

const ourConfig = ({ isBaseOnly, isBuild, status, reload, output } = {}) =>
  _.defaultsDeep(
    {
      babel: () => require('../../configs/babel/babel.app')(),
      webpack: ({ babel } = {}) =>
        require('../../configs/webpack/webpack.app')({
          babel,
          isBaseOnly,
          isBuild,
          status,
          reload,
          output
        }),
      storybook: {
        babel: () => require('../../configs/babel/babel.app')(),
        webpack: ({ webpack } = {}) =>
          require('../../configs/webpack/webpack.storybook')({
            baseWebpack: webpack
          })
      }
    },
    defaultConfig,
    baseConfig
  );

module.exports = (
  { isBaseOnly, isBuild, cssModules, status, reload, output } = {}
) =>
  mergeUserConfig(
    ourConfig({ isBaseOnly, isBuild, cssModules, status, reload, output })
  );
