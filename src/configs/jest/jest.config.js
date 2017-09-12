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
const generateNwbWebpackConfig = require('nwb/lib/createWebpackConfig').default;
const u = require('../../libs/util');

// Setup webpack ⟺ jest aliases
const activeNwbConfig = require(u.nwbConfigPath());
const webpackConfig = generateNwbWebpackConfig({}, {}, activeNwbConfig);
const webpackAliases =
  webpackConfig.resolve && webpackConfig.resolve.alias
    ? webpackConfig.resolve.alias
    : {};
const webpackAliasesNameMap = Object.keys(
  webpackAliases
).reduce((conf, module) => {
  conf[`^${module}(.*)$`] = `${webpackAliases[module]}$1`;
  return conf;
}, {});

const moduleNameMap = {
  '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': path.resolve(
    __dirname,
    '../mock-modules/file.js'
  ),
  '\\.(css|less)$': u.to(__dirname, '../mock-modules/style.js'),
  // Resolve stories path for storyshots
  // NOTE: storyshots can only be run from component level!
  '^~stories$': `${process.cwd()}/src/.stories.js`
};

module.exports = {
  resolver: u.to(__dirname, './jest-resolve.js'),
  // We need to use our collection of babel preset tranforms.
  transform: {
    '^.+\\.jsx?$': u.to(__dirname, './jest-transform.js')
  },
  transformIgnorePatterns: [],

  // Since react, react-dom, react-test-renderer are often used in tests,
  // they're installed in plz-cli and made available through this config.
  modulePaths: [u.to(__dirname, '../../../node_modules')],
  rootDir: process.cwd(),
  modulePathIgnorePatterns: ['node_modules'],
  moduleNameMapper: Object.assign(moduleNameMap, webpackAliasesNameMap),

  // Only run tests in source directory
  testRegex: '(/src/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$',

  // You must use jest.mock('module') instead.
  automock: false
};
