const merge = require('webpack-merge');
const rules = require('src/configs/webpack/parts/rules');
const pluginPresets = require('src/configs/webpack/parts/plugin-presets');

const parts = {
  base: ({ babel } = {}) => ({
    module: {
      rules: [
        rules.svg(),
        rules.images(),
        rules.webfonts(),
        rules.video(),
        rules.audio(),
        rules.svgReact(),
        rules.babel({ config: babel })
      ],
      // Don't recursively parse __tests__/__snapshots directories.
      exprContextRegExp: /^\.\/(?!__).*$/
    },

    plugins: [...pluginPresets.moduleHealth()],

    resolve: {
      extensions: ['.js', '.json']
    },

    devtool: 'inline-source-map'
  }),
  withCss: () => ({
    module: {
      rules: [rules.css(), rules.css({ vendor: true })]
    }
  })
};

module.exports = ({ babel }) => merge(parts.base({ babel }), parts.withCss());

module.exports.parts = parts;
