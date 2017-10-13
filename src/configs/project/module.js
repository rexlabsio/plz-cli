const _ = require('lodash');
const mergeWithUserConfig = require('../../utils/merge-user-config');
const baseConfig = require('../../configs/project/defaults/base');
const defaultConfig = require('../../configs/project/defaults/module');

const ourConfig = ({ modulesType } = {}) =>
  _.defaultsDeep(
    {
      babel: () => require('../../configs/babel/babel.module')({ modulesType }),
      webpack: ({ babel } = {}) =>
        require('../../configs/webpack/webpack.module')({ babel }),
      storybook: {
        babel: ({ modulesType } = {}) =>
          require('../../configs/babel/babel.module')({ modulesType }),
        webpack: ({ webpack } = {}) =>
          require('../../configs/webpack/webpack.storybook')({
            baseWebpack: webpack
          })
      }
    },
    defaultConfig,
    baseConfig
  );

module.exports = ({ modulesType } = {}) =>
  mergeWithUserConfig(ourConfig({ modulesType }));
