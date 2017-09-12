/*
|-------------------------------------------------------------------------------
| Build command
|-------------------------------------------------------------------------------
|
| Compiles the source of packages into their various forms of distribution.
|
*/

// Setting node env specifically here
process.env.NODE_ENV = 'production';

const path = require('path');
const u = require('../libs/util');
const nwb = require('../libs/nwb-manager');

const REACT_COMPONENT_ARGS = [
  'build',
  'build-react-component',
  ['--no-demo-build', '--no-wrap-prototype'],
  {
    NODE_ENV: 'production',
    BABEL_DISABLE_CACHE: '1'
  },
  {
    progress: 'Building package...',
    succeed: 'Built bundles.',
    failed: 'Build failed.'
  }
];

REACT_APP_ARGS = [
  'build',
  'build-react-app',
  ['src/index.js', 'public'],
  {
    NODE_ENV: 'production',
    BABEL_DISABLE_CACHE: '1'
  },
  {
    progress: 'Building app...',
    succeed: 'Built app.',
    failed: 'Build failed.'
  }
];

const BUILD_TYPE_MAPPING = {
  undefined: REACT_COMPONENT_ARGS,
  module: REACT_COMPONENT_ARGS,
  'react-component': REACT_COMPONENT_ARGS,
  'react-app': REACT_APP_ARGS
};

module.exports = () => {
  const type = u.loadCliConfig().type;
  nwb.runNwbAlias.apply(nwb, BUILD_TYPE_MAPPING[type]).catch(u.unhandledError);
};
