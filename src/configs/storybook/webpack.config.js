/*
|-------------------------------------------------------------------------------
| Storybook & Storyshots Webpack Config
|-------------------------------------------------------------------------------
|
| Notes:
|  -This file is executed by the storybook node process, not plz-cli.
|
| See the following for more details:
|  - configs/webpack/webpack.storybook.js
|  - configs/storybook/config.js
|
*/

module.exports = function (storybookBaseConfig) {
  return require('../../configs/webpack/webpack.storybook')(
    storybookBaseConfig
  );
};
