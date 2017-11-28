/*
|-------------------------------------------------------------------------------
| Jest Config
|-------------------------------------------------------------------------------
| https://facebook.github.io/jest/docs/api.html#configuration
|
| When our webpack config defines module aliases, then we must convert them to
| module name mappings for jest to consume:
| https://facebook.github.io/jest/docs/configuration.html#modulenamemapper-object-string-string
|
*/

const path = require('path');
const u = require('../../utils');
const aliases = require('../../configs/webpack/parts/aliases');
const cliConfig = require('../../configs/jest/jest-cli-config')();
const { assign, keys } = Object;

/*
|-------------------------------------------------------------------------------
| Webpack aliases mapped to Jest config structure, but will essentially be the same thing.
*/
const webpackAliases = aliases.base();
const transformedWebpackModuleAliases = keys(
  webpackAliases
).reduce((conf, module) => {
  conf[`^${module}(.*)$`] = `${webpackAliases[module]}$1`;
  return conf;
}, {});

/*
|-------------------------------------------------------------------------------
| Modules that aren't JS, that webpack can handle, need to be pointed to mock js
| files.
*/
const blobs =
  '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$';
const css = '\\.(css|less|scss)$';
const mockedAssetModules = {
  [blobs]: path.resolve(__dirname, './mock-modules/file.js'),
  [css]: u.to(__dirname, './mock-modules/style.js')
};

/*
|-------------------------------------------------------------------------------
| Stories are loaded in one spot (won't work with monorepos!)
*/
const deterministicStoryAliases = {
  '^~stories$': `${process.cwd()}/src/.stories.js`
};

module.exports = {
  moduleNameMapper: assign(
    mockedAssetModules,
    transformedWebpackModuleAliases,
    deterministicStoryAliases
  ),
  modulePathIgnorePatterns: ['node_modules'],
  rootDir: process.cwd(),
  /*
  |--------------------------------------------------------
  | Override the default module resolver with plz features
  */
  resolver: u.to(__dirname, './jest-resolve.js'),

  /*
  |--------------------------------------------------------
  | Transform all js files to use babel.
  */
  transform: {
    '^.+\\.jsx?$': u.to(__dirname, './jest-transform.js')
  },
  transformIgnorePatterns: cliConfig.runtimeCompilation ? [] : ['node_modules'],

  /*
  |--------------------------------------------------------
  | Since react packages are often used in tests, we make
  | the dependencies available from plz's node_modules as
  | well as the local node_modules.
  */
  modulePaths: [
    u.cwdTo('node_modules'),
    u.to(__dirname, '../../../node_modules')
  ],

  /*
  |-------------------------------------------------------
  | Only run tests in source directory
  */
  testRegex: '(/src/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$',

  // You must use jest.mock('module') instead.

  /*
  |-------------------------------------------------------
  | This *should* already be default, but we want to be
  | explicit about our intentions about module resolution.
  */
  automock: false
};
