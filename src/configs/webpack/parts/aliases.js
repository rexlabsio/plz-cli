const u = require('src/utils');

module.exports = {
  base: () => ({
    src: u.cwdTo('src'),
    data: u.cwdTo('src/data'),
    view: u.cwdTo('src/view'),
    utils: u.cwdTo('src/utils'),
    assets: u.cwdTo('src/assets'),
    config: u.cwdTo('src/config.js'),
    routes: u.cwdTo('src/routes.js'),
    store: u.cwdTo('src/store.js'),
    theme: u.cwdTo('src/theme.js')
  })
};
