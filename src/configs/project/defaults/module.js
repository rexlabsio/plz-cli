/*
|-------------------------------------------------------------------------------
| Module Plz Config
|-------------------------------------------------------------------------------
|
| The plz config is loaded from `package.json`, under `config.plz` path.
|
*/

const { PROJECT_TYPE_MODULE } = require('src/utils/constants');

const plzModuleConfigDefault = {
  projectType: PROJECT_TYPE_MODULE
};
module.exports = plzModuleConfigDefault;
