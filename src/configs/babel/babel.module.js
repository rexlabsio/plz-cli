const merge = require('webpack-merge');
const babelBaseConfig = require('../../configs/babel/babel.base');

const babelModuleConfig = {};

const babelModuleEnvConfig = {
  prod: {
    plugins: [
      // Optimises props for later removal, via minifier dead-branch removals.
      // NOTE: Disables introspection for smart IDE's like Intellij.
      [
        'transform-react-remove-prop-types',
        {
          mode: 'wrap'
        }
      ]
    ]
  },
  dev: {}
};

module.exports = ({ modulesType } = {}) =>
  merge(
    babelBaseConfig({ modulesType }),
    babelModuleConfig,
    process.env.NODE_ENV === 'production'
      ? babelModuleEnvConfig.prod
      : babelModuleEnvConfig.dev
  );
