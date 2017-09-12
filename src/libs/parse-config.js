/*
|-------------------------------------------------------------------------------
| Parse PLZ Config
|-------------------------------------------------------------------------------
|
| Get's the config for plz from a package.json object, given the following path:
|
|  `config.plz`
|
*/

const _ = require('lodash');
const defautConfig = require('../configs/plz-config-default');
const appConfig = require('../configs/plz-config-app');

function parseCliConfig (pkgJsonObj) {
  const userConfig = _.get(pkgJsonObj, 'config.plz', {});
  const configOrder = [userConfig];
  if (userConfig.type === 'react-app') configOrder.push(appConfig);
  configOrder.push(defautConfig);
  return _.defaultsDeep(...configOrder);
}

module.exports = parseCliConfig;
