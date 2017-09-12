/*
|-------------------------------------------------------------------------------
| App Config Loader
|-------------------------------------------------------------------------------
|
| Exposes app environment variables, resolving dev variables when available.
|
| ```js
| import config from 'config'
| config.API_URL
| ```
|
*/

const userConfig = require('../env.js');

const isDev = process.env.NODE_ENV !== 'production';
console.log(`Config loading in ${isDev ? 'development' : 'production'} mode.`);

const devUserConfig = isDev ? userConfig.dev : {};
const flattenedUserConfig = Object.assign({}, userConfig, devUserConfig);
delete flattenedUserConfig['dev'];

module.exports = flattenedUserConfig;
