const u = require('../../../utils');

module.exports = {
  base: () => ({
    src: u.cwdTo('src'),
    data: u.cwdTo('src/data'),
    view: u.cwdTo('src/view'),
    utils: u.cwdTo('src/utils'),
    assets: u.cwdTo('src/assets'),
    theme: u.cwdTo('src/theme'),
    routes: u.cwdTo('src/routes'),
    config: u.cwdTo('src/config.js'),
    store: u.cwdTo('src/store.js')
  })
};
