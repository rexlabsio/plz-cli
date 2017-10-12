const merge = require('webpack-merge');
const babelBaseConfig = require('src/configs/babel/babel.base');

const babelAppConfig = {};

const babelAppEnvConfig = {
  prod: {
    plugins: ['transform-react-remove-prop-types']
  },
  dev: {
    plugins: [
      [
        // NOTE: Should remove once we upgrade to later version of babel.
        'react-transform',
        {
          transforms: [
            {
              transform: require.resolve('react-transform-hmr'),
              imports: ['react'],
              locals: ['module']
            },
            {
              transform: require.resolve('react-transform-catch-errors'),
              imports: ['react', require.resolve('redbox-noreact')]
            }
          ]
        }
      ],
      'transform-react-jsx-source',
      'transform-react-jsx-self'
    ]
  }
};

module.exports = () =>
  merge(
    babelBaseConfig(),
    babelAppConfig,
    process.env.NODE_ENV === 'production'
      ? babelAppEnvConfig.prod
      : babelAppEnvConfig.dev
  );
