const plugins = require('src/configs/webpack/parts/plugins');

const pluginPresets = {};

pluginPresets.moduleHealth = () => [
  plugins.caseSensitivePaths(),
  plugins.env(),
  plugins.moment()
];

pluginPresets.hmr = () => [
  plugins.hmr(),
  plugins.errorsStopOutput(),
  plugins.showRelativePathInSourceMaps()
];

pluginPresets.devServer = ({ status } = {}) => [
  ...pluginPresets.hmr(),
  plugins.status(status),
  plugins.html()
];

pluginPresets.appBuild = () => [
  plugins.extractCss(),
  plugins.chunkVendorJS(),

  /*
  |-----------------------------------------------------------------------------
  | Deterministic hashing for long-term caching.
  |-----------------------------------------------------------------------------
  */

  // Generate stable module ids instead of having Webpack assign integers.
  // HashedModuleIdsPlugin (vendored from Webpack 2) does this without
  // adding too much to bundle size and NamedModulesPlugin allows for
  // easier debugging of development builds.
  plugins.identModulesInBundle(),

  // The MD5 Hash plugin seems to make [chunkhash] for .js files behave
  // like [contenthash] does for extracted .css files, which is essential
  // for deterministic hashing.
  plugins.hashOutputFiles(),

  /*
  |-----------------------------------------------------------------------------
  | App Manifest
  |-----------------------------------------------------------------------------
  */

  // The Webpack manifest is normally folded into the last chunk, changing
  // its hash - prevent this by extracting the manifest into its own
  // chunk - also essential for deterministic hashing.
  plugins.chunkManifest(),
  plugins.injectManifest(),

  plugins.supportv1Loaders(),
  plugins.uglify(),
  plugins.html(),
  plugins.stats()
];

module.exports = pluginPresets;
