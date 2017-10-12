/*
|-------------------------------------------------------------------------------
| React Component Module Plz Config
|-------------------------------------------------------------------------------
|
| The plz config is loaded from `package.json`, under `config.plz` path.
|
*/

const { PROJECT_TYPE_REACT_COMPONENT } = require('src/utils/constants');

const plzReactComponentConfigDefault = {
  projectType: PROJECT_TYPE_REACT_COMPONENT
};
module.exports = plzReactComponentConfigDefault;
