/*
|-------------------------------------------------------------------------------
| Storybook & Storyshots Webpack Config
|-------------------------------------------------------------------------------
|
| Notes:
|  - This file is executed by the storybook node process, not plz-cli.
|  - By the time this is being required, there should be a temp .babelrc in the
|    storybook config dir. This is used to load babel configs.
|
| Generation of Webpack Config:
|  1. Get our project specific webpack config
|  2. Remove rules etc from our config that Storybook's handles
|  3. Add additional config for: fixing fs module reference, and aliasing
|  4. Custom module resolver so that runtime compilation works (when on)
|  5. Finally, pass it to the configured storybook webpack middleware for user
|     intervention (unlikely).
|
| Other Details:
|  See comments in `./config.js` for longer explanation of applied hacks.
|
*/

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const merge = require('webpack-merge');
const pkgUp = require('read-pkg-up');
const loadCliConfig = require('../../utils/load-cli-config');
const {
  PROJECT_TYPE_REACT_COMPONENT,
  PROJECT_TYPE_MODULE,
  PROJECT_TYPE_REACT_APP
} = require('../../utils/constants');

module.exports = function (storybookBaseConfig) {
  const { projectType } = loadCliConfig();

  let cliConfig = null;
  switch (projectType) {
    case PROJECT_TYPE_MODULE:
    case PROJECT_TYPE_REACT_COMPONENT:
      cliConfig = require('../../configs/project/module')();
      break;
    case PROJECT_TYPE_REACT_APP:
      // Makes sure our babel configs aren't geared for HMR
      cliConfig = require('../../configs/project/app')({ isBaseOnly: true });
      break;
    default:
      throw new Error(
        `Could not match the project type "${projectType}" to while loading storybook's webpack config.`
      );
  }

  const resolvingStorybookConfig = merge(
    dropRulesHandledByStorybook(cliConfig.webpack),
    addNoFsModule(),
    addStorybookOptions(cliConfig.storybook),
    dropPluginsHandledByPlz(storybookBaseConfig)
  );
  if (cliConfig.runtimeCompilation) {
    includePlzPackagesToBabel(resolvingStorybookConfig);
  }

  return cliConfig.storybook.webpack(resolvingStorybookConfig);
};

/*
|-------------------------------------------------------------------------------
| Utils
*/

function addNoFsModule () {
  // HACK: Config carried over from a hack @julian did - probably important.
  // NOTE by Julian: I don't know why I did it if I did...
  // NOTE by Lochlan: Uh ok - well I'm going to leave it because scared.
  return {
    node: {
      fs: 'empty'
    }
  };
}

function addStorybookOptions (storybookOptions = {}) {
  storybookOptions.name = storybookOptions.name || 'Component';
  return {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.CLI_STORYBOOK_OPTIONS': JSON.stringify(
          _.omit(storybookOptions, ['webpack', 'babel'])
        )
      })
    ]
  };
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

/*
|-------------------------------------------------------------------------------
|  Enables runtime compilation of certain packages in node_modules.
|   1. Packages (also) managed by plz-cli
|   2. ...nothing else yet.
*/
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

function dropPluginsHandledByPlz (conf) {
  const excludedPlugins = [
    // We usually have different extraction loaders setup
    'ExtractTextPlugin'
  ];
  const replacementPlugins = {
    // Storybook doesn't use newest uglify, which supports esnext
    UglifyJsPlugin: require('../../configs/webpack/parts/plugins').uglify()
  };

  conf.plugins = conf.plugins.reduce((plugins, plugin) => {
    const name = plugin.constructor.name;
    if (excludedPlugins.includes(name)) {
    } else if (Object.keys(replacementPlugins).includes(name)) {
      plugins.push(replacementPlugins[name]);
    } else {
      plugins.push(plugin);
    }
    return plugins;
  }, []);

  return conf;
}

/*
|-------------------------------------------------------------------------------
| Filter out rules that either:
|  1. Break storybook
|  2. Are already controlled by storybook
*/
function dropRulesHandledByStorybook (conf) {
  conf.module.rules = conf.module.rules
    // Our babel config is still used, but via dumping a .babelrc file
    .filter(({ loader = '' }) => !loader.includes('babel-loader'))
    // We don't want to include our extract css rules
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
