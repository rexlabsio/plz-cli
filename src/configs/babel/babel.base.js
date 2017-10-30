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
        useBuiltIns: 'usage',
        modules: modulesType,
        targets: {
          node: '8',
          browsers: require('@rexlabs/browserlist-config')
        },
        exclude: ['es6.promise']
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
        helpers: true,
        polyfill: true,
        regenerator: true
      }
    ],
    'syntax-dynamic-import'
  ]
});
