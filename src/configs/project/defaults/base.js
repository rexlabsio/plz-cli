/*
|-------------------------------------------------------------------------------
| Default Plz Config
|-------------------------------------------------------------------------------
|
| The plz config is loaded from `package.json`, under `config.plz` path.
|
*/

const { PROJECT_TYPE_MODULE } = require('src/utils/constants');

/** @type TypePlzConfig */
const plzConfigDefault = {
  projectType: PROJECT_TYPE_MODULE,
  buildDir: './',
  runtimeCompilation: true,
  storybook: {
    url: undefined,
    goFullScreen: false,
    showLeftPanel: true,
    showDownPanel: true,
    showSearchBox: false,
    downPanelInRight: true,
    sortStoriesByKind: false
  }
};

module.exports = plzConfigDefault;

/**
 *
 * @typedef {Object} TypePlzStorybookConfig
 * @property {string} url
 * @property {boolean} goFullScreen
 * @property {boolean} showLeftPanel
 * @property {boolean} showDownPanel
 * @property {boolean} showSearchBox
 * @property {boolean} downPanelInRight
 * @property {boolean} sortStoriesByKind
 */

/**
 *
 * @typedef {Object} TypePlzConfig
 * @property {string} projectType
 * @property {string} buildDir
 * @property {boolean} runtimeCompilation
 * @property {TypePlzStorybookConfig} storybook
 * @property {Function|Object} babel
 * @property {Function|Object} webpack
 */
