/*
|-------------------------------------------------------------------------------
| App Plz Config
|-------------------------------------------------------------------------------
|
| The plz config is loaded from `package.json`, under `config.plz` path.
|
| Disables runtime compilation of plz managed dependencies.
|
*/

const plzConfigDefault = {
  type: 'react-app',
  runtimeCompilation: false
};
module.exports = plzConfigDefault;
