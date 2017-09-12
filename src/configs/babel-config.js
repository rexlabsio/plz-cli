/*
|-------------------------------------------------------------------------------
| Babel Config
|-------------------------------------------------------------------------------
|
| We store the real babel config in the storybook config directory.
| Note: Must have a .babelrc in the storybook config dir, as that is the only
|       method to override it's rules. So, we'll just use that to keep config DRY.
|
| Babel Env Settings:
|  - Node >= 7: https://kangax.github.io/compat-table/es6/#node7
|  - Last 2 versions, to get range on Safari (worst browser)
*/

const fse = require('fs-extra');
const u = require('../libs/util');
const babelConfig = fse.readJsonSync(u.to(__dirname, 'storybook/.babelrc'));

module.exports = babelConfig;
