/*
|-------------------------------------------------------------------------------
| Custom 'module resolver' for Jest
|-------------------------------------------------------------------------------
|
| Forked from Jest, this is the default 'resolver' with the added benefit of
| remapping the "main" field to the value of the "plz:main" field, when present.
|
*/

const fs = require('fs');
const path = require('path');
const resolve = require('resolve');
const browserResolve = require('browser-resolve');

function defaultResolver (path, options) {
  const resv = options.browser ? browserResolve : resolve;

  return resv.sync(path, {
    basedir: options.basedir,
    extensions: options.extensions,
    moduleDirectory: options.moduleDirectory,
    paths: options.paths,
    packageFilter: enablePlzCompilation
  });
}

module.exports = defaultResolver;

/*
|-------------------------------------------------------------------------------
| Utils
*/

global.__plz_pkg_registry = global.__plz_pkg_registry || new Set();
const addToRegistry = x => global.__plz_pkg_registry.add(x);
function enablePlzCompilation (pkg, pkgDir) {
  const srcPath = pkg['plz:main'];
  // Note: We should check the existence of src so that published packages don't
  //       break app's that use plz
  if (srcPath && fs.existsSync(path.resolve(pkgDir, srcPath))) {
    addToRegistry(pkgDir);
    return Object.assign({}, pkg, { main: srcPath });
  } else {
    return pkg;
  }
}
