/*
|-------------------------------------------------------------------------------
| Clean command
|-------------------------------------------------------------------------------
|
| Removes files and directories generated from previous Builds.
|
*/

const u = require('../libs/util');
const nwb = require('../libs/nwb-manager');

const CLEAN_TYPE_CMD_MAPPING = {
  undefined: 'clean-module',
  module: 'clean-module',
  'react-component': 'clean-module',
  'react-app': 'clean-app'
};
const CLEAN_TYPE_ARGS_MAPPING = {
  'react-app': ['public']
};

module.exports = () => {
  const type = u.loadCliConfig().type;
  nwb
    .runNwbAlias(
      'clean',
      CLEAN_TYPE_CMD_MAPPING[type],
      CLEAN_TYPE_ARGS_MAPPING[type],
      undefined,
    {
      progress: 'Cleaning...',
      succeed: 'Cleaned.',
      failed: 'Cleaning failed.'
    }
    )
    .catch(u.unhandledError);
};
