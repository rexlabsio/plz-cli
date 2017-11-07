const merge = require('webpack-merge');
const u = require('../../utils');
const rules = require('../../configs/webpack/parts/rules');
const aliases = require('../../configs/webpack/parts/aliases');
const pluginPresets = require('../../configs/webpack/parts/plugin-presets');
const loadCliConfig = require('../../utils/load-cli-config');

const parts = {
  base: ({ babel } = {}) => ({
    module: {
      rules: [
        rules.svg(),
        rules.images(),
        rules.webfonts(),
        rules.video(),
        rules.audio(),
        rules.svgReact(),
        rules.babel({ config: babel })
      ],
      // Don't recursively parse __tests__/__snapshots directories.
      exprContextRegExp: /^\.\/(?!__).*$/
    },

    plugins: pluginPresets.moduleHealth(),

    resolve: {
      extensions: ['.js', '.json'],
      alias: aliases.base()
    }
  }),

  dev: ({ status, reload, cssModules } = {}) => {
    cssModules && u.debug('cssModules enabled for dev');
    return {
      entry: [
        require.resolve('../../configs/webpack/parts/polyfill.js'),
        `${require.resolve('webpack-hot-middleware/client')}${reload
          ? '?reload=true'
          : ''}`,
        u.to('src/index.js')
      ],

      // NOTE: Nothing is outputted, but the dev-server needs this to not break.
      output: {
        path: u.cwdTo('public'),
        filename: 'app.js',
        publicPath: '/'
      },

      module: {
        rules: [rules.css({ cssModules }), rules.css({ vendor: true })]
      },

      plugins: pluginPresets.devServer({ status }),

      devtool: 'inline-source-map'
    };
  },

  build: ({ output = 'public', cssModules } = {}) => {
    const production = process.env.NODE_ENV === 'production';
    const filenamePattern = production
      ? '[name].[chunkhash:8].js'
      : '[name].js';

    cssModules && u.debug('cssModules enabled for build');

    return {
      entry: {
        app: [
          require.resolve('../../configs/webpack/parts/polyfill.js'),
          u.cwdTo('src/index.js')
        ]
      },

      output: {
        filename: filenamePattern,
        chunkFilename: filenamePattern,
        path: u.to(output),
        publicPath: '/'
      },

      module: {
        rules: [
          rules.css({ isExtracting: true, cssModules }),
          rules.css({ vendor: true, isExtracting: true })
        ]
      },

      plugins: pluginPresets.appBuild(),

      devtool: 'source-map'
    };
  }
};

module.exports = (
  { babel, isBaseOnly, isBuild, status, reload, output } = {}
) => {
  const { cssModules } = loadCliConfig();
  return isBaseOnly
    ? parts.base({ babel })
    : merge(
      parts.base({ babel }),
      isBuild
        ? parts.build({ output, cssModules })
        : parts.dev({ status, reload, cssModules })
    );
};
