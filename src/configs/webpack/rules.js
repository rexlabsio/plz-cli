module.exports = {
  inlineSvg: {
    test: /\.svg$/,
    exclude: /node_modules/,
    loader: require.resolve('svg-react-loader')
  },
  disableNwbRule: {
    // HACK: Disables nwb-internal svg rule, since we cannot override the 'loader' prop with our own.
    //       See `extra.module.rules`; our own svg rule/loader.
    include: /__disabled__/
  },
  includeAllJsNwbRule: {
    exclude: /__disabled__/,
    options: { babelrc: false, cacheDirectory: false }
  }
};
