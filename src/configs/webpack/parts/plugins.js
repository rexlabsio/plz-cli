const webpack = require('webpack');
const merge = require('webpack-merge');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Md5HashPlugin = require('webpack-md5-hash');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const u = require('src/utils');
const StatusPlugin = require('src/configs/webpack/plugins/status-plugin');
const InjectManifestPlugin = require('src/configs/webpack/plugins/inject-manifest-plugin.js');

let plugins = {};

plugins.caseSensitivePaths = () => new CaseSensitivePathsPlugin();

plugins.env = () =>
  new webpack.DefinePlugin({
    'process.env.CLI_ARGV': JSON.stringify(u.globalArgv()),
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    )
  });

plugins.moment = ({ locals = ['en-au'] } = {}) =>
  new webpack.ContextReplacementPlugin(
    /moment[/\\]locale$/,
    new RegExp(`^\\.\\/(${locals.join('|')})$`)
  );

plugins.status = (opts = {}) => new StatusPlugin(opts);

plugins.hmr = () => new webpack.HotModuleReplacementPlugin({});

plugins.errorsStopOutput = () => new webpack.NoEmitOnErrorsPlugin();

plugins.showRelativePathInSourceMaps = () => new webpack.NamedModulesPlugin();

plugins.html = opts =>
  new HtmlPlugin({
    chunksSortMode: 'dependency',
    template: './src/view/app-shell.html',
    mountId: 'app',
    title: u.getPackageJson().name,
    ...opts
  });

plugins.stats = ({ filename = 'stats.json' } = {}) =>
  new StatsPlugin(filename, { chunkModules: true });

plugins.extractCss = () =>
  new ExtractTextPlugin({
    filename:
      process.env.NODE_ENV === 'production'
        ? '[name].[chunkhash:8].js'
        : '[name].js'
  });

plugins.chunkVendorJS = () =>
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks (module, count) {
      return module.resource && module.resource.includes('node_modules');
    }
  });

plugins.chunkManifest = () =>
  new webpack.optimize.CommonsChunkPlugin({ name: 'manifest' });

plugins.injectManifest = () => InjectManifestPlugin;

plugins.identModulesInBundle = ({ stableIds } = {}) =>
  process.env.NODE_ENV === 'production'
    ? !stableIds ? () => {} : new webpack.HashedModuleIdsPlugin()
    : new webpack.NamedModulesPlugin();

plugins.hashOutputFiles = () => new Md5HashPlugin();

plugins.supportv1Loaders = () =>
  new webpack.LoaderOptionsPlugin({
    debug: false,
    minimize: true
  });

plugins.uglify = ({ supportsElementStyles = true } = {}) =>
  new UglifyJSPlugin({
    uglifyOptions: merge(
      {
        ecma: 8,
        beautify: false,
        compress: {
          warnings: false,
          keep_fnames: true
        },
        mangle: {
          keep_fnames: true
        }
      },
      !supportsElementStyles
        ? {}
        : {
          compress: {
            keep_fnames: true
          },
          mangle: {
            keep_fnames: true
          }
        }
    )
  });

module.exports = plugins;
