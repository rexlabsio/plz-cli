/*
|-------------------------------------------------------------------------------
| NWB Configuration - React Components
|-------------------------------------------------------------------------------
|
| The configuration for packages of React Components requires:
|  - module bundling
|  - babel transforms
|  - css module handling
|  - dev server configuration
|
| https://github.com/insin/nwb/blob/next/docs/Configuration.md
|
*/

const babelConfig = require('../babel-config');
const u = require('../../libs/util');
const rules = require('./rules');

u.debug('nwb babel:\n', babelConfig);
module.exports = {
  type: 'react-component',
  polyfill: false,
  npm: {
    esModules: true,
    umd: false
  },
  babel: babelConfig,
  webpack: {
    rules: {
      svg: rules.disableNwbRule
    },
    extra: {
      devtool: 'inline-source-map',
      module: {
        rules: [rules.inlineSvg],
        // Makes sure that our __tests__/__snapshots directories are never recursively parsed.
        exprContextRegExp: /^\.\/(?!__).*$/
      }
    }
  }
};
