/*
|-------------------------------------------------------------------------------
| Jest Code Transformer
|-------------------------------------------------------------------------------
|
| An explicit code transformer is required by Jest, because we use our own babel
| configuration for building and demoing packages.
|
| We always add babel-plugin-transform-runtime, as it's required for async/await
| syntax in tests, since polyfills aren't added to the environment by webpack.
|
*/

const babelJest = require('babel-jest');
const u = require('../../utils');
const loadCliConfig = require('../../utils/load-cli-config');
const {
  PROJECT_TYPE_MODULE,
  PROJECT_TYPE_REACT_COMPONENT,
  PROJECT_TYPE_REACT_APP
} = require('../../utils/constants');

const { projectType } = loadCliConfig();

let cliConfig = null;
switch (projectType) {
  case PROJECT_TYPE_MODULE:
  case PROJECT_TYPE_REACT_COMPONENT:
    cliConfig = require('../../configs/project/module')();
    break;
  case PROJECT_TYPE_REACT_APP:
    cliConfig = require('../../configs/project/app')({ isBaseOnly: true });
    break;
  default:
    throw new Error(
      `Could not match the project type "${projectType}" to while loading storybook's webpack config.`
    );
}

const jestBabelConfig = Object.assign(
  {},
  require('../../configs/babel/babel.base')()
);
const transform = babelJest.createTransformer(jestBabelConfig);
const plzTransform = Object.assign({}, transform);

if (cliConfig.runtimeCompilation) {
  plzTransform.process = processWithPlz;
}

module.exports = plzTransform;

/*
|-------------------------------------------------------------------------------
| Utils
*/

// Filter the files being process to:
//  1. Files inside the local package
//  2. External files that can be built with plz-cli (node_modules or external)
function processWithPlz (src, filename) {
  return canCompileWithPlz(filename)
    ? transform.process.apply(null, arguments)
    : src;
}

let pkgCache = {};
// Jest's runtime can't symlinks (afaik), so we only need to look for dependencies
// inside a node_modules directory. eg A linked dependency is resolved to it's
// full path.
const nodeModulesReg = /node_modules/;
function canCompileWithPlz (filename) {
  const isUnderNodeModules = nodeModulesReg.test(filename);
  let isPkgRegistered = false;
  isUnderNodeModules &&
    global.__plz_pkg_registry.forEach(pkg => {
      if (isPkgRegistered) return;
      if (filename.includes(pkg)) {
        const isPkgLocalFile =
          pkgCache[pkg] || new RegExp(`${pkg}/(?!node_modules)`);
        pkgCache[pkg] = isPkgLocalFile;
        isPkgRegistered = isPkgLocalFile.test(filename);
      }
    });
  const isCompilableUnderNodeModules = isUnderNodeModules && isPkgRegistered;
  const isCompilable = !isUnderNodeModules || isCompilableUnderNodeModules;
  if (isCompilable) u.debug(`Jest Transforming: ${filename}`);
  return isCompilable;
}
