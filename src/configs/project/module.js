const _ = require('lodash');
const mergeWithUserConfig = require('src/utils/merge-user-config');
const baseConfig = require('src/configs/project/defaults/base');
const defaultConfig = require('src/configs/project/defaults/module');

const ourConfig = ({ modulesType } = {}) =>
  _.defaultsDeep(
    {
      babel: () => require('src/configs/babel/babel.module')({ modulesType }),
      webpack: ({ babel } = {}) =>
        require('src/configs/webpack/webpack.module')({ babel }),
      storybook: {
        babel: ({ modulesType } = {}) =>
          require('src/configs/babel/babel.module')({ modulesType }),
        webpack: ({ webpack } = {}) =>
          require('src/configs/webpack/webpack.storybook')({
            baseWebpack: webpack
          })
      }
    },
    defaultConfig,
    baseConfig
  );

module.exports = ({ modulesType } = {}) =>
  mergeWithUserConfig(ourConfig({ modulesType }));
