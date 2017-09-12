/*
|-------------------------------------------------------------------------------
| Default Plz Config
|-------------------------------------------------------------------------------
|
| The plz config is loaded from `package.json`, under `config.plz` path.
|
*/

const plzConfigDefault = {
  type: 'react-component',
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
