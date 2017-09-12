/*
|-------------------------------------------------------------------------------
| NWB Configuration - React App
|-------------------------------------------------------------------------------
|
| The configuration for packages of React Components requires:
|  - module bundling
|  - babel transforms
|  - dev server configuration
|
| https://github.com/insin/nwb/blob/next/docs/Configuration.md
|
*/

const path = require('path');
const StatsPlugin = require('stats-webpack-plugin');
const babelConfig = require('../babel-config');
const u = require('../../libs/util');
const rules = require('./rules');

function relativePath (relativePath) {
  return u.cwdTo(relativePath);
}

u.debug('nwb babel:\n', babelConfig);
module.exports = {
  type: 'react-app',
  polyfill: true,
  babel: babelConfig,
  webpack: {
    // Makes sure @rexlabs/element-styles works, which needs
    // `Function.prototype.name` to work in some cases.
    uglify:
      process.env.NODE_ENV === 'production'
        ? {
          beautify: false,
          compress: {
            warnings: true,
            keep_fnames: true
          },
          mangle: {
            keep_fnames: true
          }
        }
        : {},
    compat: {
      moment: {
        locales: ['en-gb', 'en-us']
      }
    },
    extractText: {
      allChunks: true
    },
    html: {
      template: './src/view/app-shell.html'
    },
    rules: {
      babel:
        process.env.NODE_ENV === 'production' ? rules.includeAllJsNwbRule : {},
      svg: rules.disableNwbRule
    },
    extra: {
      devtool:
        process.env.NODE_ENV === 'production'
          ? 'source-map'
          : 'inline-source-map', // Inline source maps just in dev mode!
      module: {
        rules: [rules.inlineSvg],
        // Makes sure that our __tests__/__snapshots directories are never recursively parsed.
        exprContextRegExp: /^\.\/(?!__).*$/
      },
      plugins: [new StatsPlugin('stats.json', { chunkModules: true })]
    },
    aliases: {
      src: relativePath('./src'),
      data: relativePath('./src/data'),
      view: relativePath('./src/view'),
      utils: relativePath('./src/utils'),
      assets: relativePath('./src/assets'),
      config: relativePath('./src/config.js'),
      routes: relativePath('./src/routes.js'),
      store: relativePath('./src/store.js'),
      theme: relativePath('./src/theme.js')
    }
  }
};
