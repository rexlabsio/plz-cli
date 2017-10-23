/*
|-------------------------------------------------------------------------------
| React App Plz Config
|-------------------------------------------------------------------------------
|
| The plz config is loaded from `package.json`, under `config.plz` path.
|
|  * Disables runtime compilation of plz managed dependencies.
|  * Outputs bundle to 'public/'
|
*/

const { PROJECT_TYPE_REACT_APP } = require('../../../utils/constants');

const plzReactAppConfigDefault = {
  projectType: PROJECT_TYPE_REACT_APP,
  buildDir: './public',
  runtimeCompilation: false,
  proxy: {}
};
module.exports = plzReactAppConfigDefault;
