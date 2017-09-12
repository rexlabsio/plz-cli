/*
|-------------------------------------------------------------------------------
| Serve command
|-------------------------------------------------------------------------------
|
| Creates a dev server, for a rapid feedback loop during development of packages
| concerned with UI.
|
*/

// Setting node env specifically to 'development' here, to ensure we can adjust
//  the webpack config according to the environment (e.g. source maps)
process.env.NODE_ENV = 'development';

const u = require('../libs/util');
const nwb = require('../libs/nwb-manager');

const SERVE_TYPE_MAPPING = {
  undefined: 'serve-react-demo',
  module: 'serve-react-demo',
  'react-component': 'serve-react-demo',
  'react-app': 'serve-react-app --reload'
};

module.exports = () => {
  const type = u.loadCliConfig().type;
  nwb.runNwbAlias('serve', SERVE_TYPE_MAPPING[type]).catch(u.unhandledError);
};
