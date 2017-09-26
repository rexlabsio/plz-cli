/*
|-------------------------------------------------------------------------------
| Storybook Webpack Config
|-------------------------------------------------------------------------------
|
| Generates the webpack config from several sources, to be used by storybook and
| storyshots.
|
| Hack Notes:
|  See comment in `./config.js` for longer explantion of hacks.
|
*/

const fs = require('fs');
const path = require('path');
const merge = require('webpack-merge');
const pkgUp = require('read-pkg-up');
const generateNwbWebpackConfig = require('nwb/lib/createWebpackConfig').default;
const u = require('../../libs/util');
const plzConfig = u.loadCliConfig();
const nwbConfig = require(u.nwbConfigPath());

module.exports = function (storybookBaseConfig) {
  const mergedConfig = merge(
    getNwbConfig(),
    getNoFsModuleWebpackConfig(),
    getStoryReadmesWebpackConfig(),
    getPackageJsonAlias(),
    storybookBaseConfig
  );

  if (plzConfig.runtimeCompilation) {
    includePlzPackagesToBabel(mergedConfig);
  }
  applyHackFixes(mergedConfig);
  return mergedConfig;
};

/*
|-------------------------------------------------------------------------------
| Utils
*/

function getNwbConfig () {
  let conf = generateNwbWebpackConfig({}, {}, nwbConfig);
  conf = dropRulesHandledByStorybook(conf);
  return conf;
}

function getNoFsModuleWebpackConfig () {
  // HACK: Config carried over from a hack @julian did - probably important.
  // NOTE by Julian: I don't know why I did it if I did...
  // NOTE by Lochlan: Uh ok - well I'm going to leave it because scared.
  return {
    node: {
      fs: 'empty'
    }
  };
}

function getStoryReadmesWebpackConfig () {
  // We want to load the content of readme's for storybook to decorate stories
  return {
    module: {
      rules: [
        {
          test: /\.md$/,
          loader: 'raw-loader'
        }
      ]
    }
  };
}

function getPackageJsonAlias () {
  const pkgJsonAliasConf = { resolve: { alias: {} } };
  setWebpackAlias(pkgJsonAliasConf, 'pkg-json', u.cwdTo('package.json'));
  setWebpackAlias(
    pkgJsonAliasConf,
    'monorepo-pkg-json',
    u.cwdTo('../../package.json')
  );
  return pkgJsonAliasConf;
}

const cwd = process.cwd();
const isLocalFile = new RegExp(`${cwd}/(?!node_modules)`);
// Webpack's resolver will read symlinks, so we must account for dependencies
// that aren't inside a node_modules directory. eg (yarn link, lerna bootstrap)
const notLocalFile = new RegExp(`((?!${cwd})|${cwd}/node_modules)`);
function onlyCompilableSrc (filename) {
  return (
    isLocalFile.test(filename) ||
    (notLocalFile.test(filename) && isPlzManaged(filename))
  );
}

function isPlzManaged (filename) {
  const { pkg, path: pkgPath } = pkgUp.sync({ cwd: filename });
  if (!pkg['plz:main']) return false;
  const srcPath = path.resolve(path.dirname(pkgPath), pkg['plz:main']);
  return fs.existsSync(srcPath);
}

function includePlzPackagesToBabel (conf) {
  // 1. Enable the 'plz:main' field; points to uncompiled src of a plz package
  conf.resolve.mainFields = ['plz:main', 'browser', 'module', 'main'];

  // 2. Modify include/exclude rules of the 'babel-loader' to load compilable src
  conf.module.rules.forEach(rule => {
    if (!(rule.loader && rule.loader.includes('babel-loader'))) return;
    delete rule.exclude; // Exclusion is managed by `onlyCompilableSrc`
    rule.include = onlyCompilableSrc;
  });
}

// HACK
function applyHackFixes (conf) {
  const filterPlugins = (...names) => {
    conf.plugins = conf.plugins.filter(
      p => !names.includes(p.constructor.name)
    );
  };

  filterPlugins(
    // Webpack versions, in nwb and storybook, were causing problems
    'ExtractTextPlugin',
    // Building storybook failed because of node_modules modules with ES6
    'UglifyJsPlugin'
  );
}

function dropRulesHandledByStorybook (conf) {
  // HACK: Filter out rules that either:
  //        1. Break storybook
  //        1. Are already controlled by storybook
  conf.module.rules = conf.module.rules
    .filter(({ loader = '' }) => !loader.includes('babel-loader'))
    .map(rule => {
      if (rule.use) {
        rule.use = rule.use.filter(
          ({ loader = '' }) => !loader.includes('extract-text')
        );
      }
      return rule;
    });
  return conf;
}

// We want to expose the packages (& repos) package.json, for meta data usage
function setWebpackAlias (conf, aliasName, aliasPath) {
  conf.resolve.alias[aliasName] = fs.existsSync(aliasPath)
    ? aliasPath
    : u.to(__dirname, '../mock-modules/object.json');
}
