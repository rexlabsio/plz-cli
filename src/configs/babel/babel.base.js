/*
|-------------------------------------------------------------------------------
| Babel Config
|-------------------------------------------------------------------------------
|
| Babel Env Settings:
|  - Node >= 7: https://kangax.github.io/compat-table/es6/#node7
|  - Last 2 versions, to get range on Safari (worst browser)
|
*/

module.exports = ({ modulesType = 'commonjs' } = {}) => ({
  presets: [
    [
      'env',
      {
        modules: modulesType,
        targets: {
          node: 7,
          browsers: 'last 2 versions'
        }
      }
    ],
    'stage-3',
    'react'
  ],
  plugins: [
    'transform-decorators-legacy',
    'transform-class-properties',
    [
      'transform-runtime',
      {
        helpers: false,
        polyfill: false,
        regenerator: true
      }
    ],
    'syntax-dynamic-import'
  ]
});
