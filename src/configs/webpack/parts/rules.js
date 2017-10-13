const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const u = require('../../../utils');

let rules = {};

rules.babel = ({ exclude = /node_modules/, include, config } = {}) => ({
  exclude: exclude,
  include: include,
  test: /\.js$/,
  loader: require.resolve('babel-loader'),
  options: {
    babelrc: false,
    cacheDirectory: true,
    ...u.absolutifyBabel(config)
  }
});

rules.css = ({ vendor, isExtracting } = {}) => {
  const styleLoader = require.resolve('style-loader');
  const postcssLoaders = [
    {
      loader: require.resolve('css-loader'),
      options: { importLoaders: 1 }
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        ident: `postcss${vendor ? '-vendor' : ''}`,
        plugins: [
          autoprefixer({
            browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9']
          })
        ]
      }
    }
  ];
  return {
    exclude: !vendor ? /node_modules/ : undefined,
    include: vendor ? /node_modules/ : undefined,
    test: /\.css$/,
    use: !isExtracting
      ? [styleLoader, ...postcssLoaders]
      : ExtractTextPlugin.extract({
        fallback: styleLoader,
        use: postcssLoaders
      })
  };
};

rules.svgReact = () => ({
  exclude: /node_modules/,
  test: /(?!\.url)\.svg$/,
  loader: require.resolve('svg-react-loader')
});

rules.url = ({ test }) => ({
  test,
  loader: require.resolve('url-loader'),
  options: {
    limit: 1,
    name: '[name].[hash:8].[ext]'
  }
});

rules.svg = () => rules.url({ test: /\.url\.svg$/ });

rules.images = () => rules.url({ test: /\.(gif|png|webp|jpe?g)$/ });

rules.webfonts = () => rules.url({ test: /\.(eot|otf|ttf|woff|woff2)$/ });

rules.video = () => rules.url({ test: /\.(mp4|ogg|webm)$/ });

rules.audio = () => rules.url({ test: /\.(wav|mp3|m4a|aac|oga)(\?.*)?$/ });

module.exports = rules;
