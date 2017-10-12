/**
 * Plugin for HtmlPlugin which inlines content for an extracted Webpack
 * manifest into the HTML page in a <script> tag before other emitted asssets
 * are injected by HtmlPlugin itself.
 * @class
 */
function InjectManifestPlugin () {
  this.plugin('compilation', compilation => {
    compilation.plugin(
      'html-webpack-plugin-before-html-processing',
      (data, cb) => {
        Object.keys(compilation.assets).forEach(key => {
          if (!key.startsWith('manifest.')) return;
          let { children } = compilation.assets[key];
          if (children && children[0]) {
            data.html = data.html.replace(
              /^(\s*)<\/body>/m,
              `$1<script>${children[0]._value}</script>\n$1</body>`
            );
            // Remove the manifest from HtmlPlugin's assets to
            // prevent a <script> tag being created for it.
            var manifestIndex = data.assets.js.indexOf(
              data.assets.publicPath + key
            );
            data.assets.js.splice(manifestIndex, 1);
            delete data.assets.chunks.manifest;
          }
        });
        cb(null, data);
      }
    );
  });
}

module.exports = InjectManifestPlugin;
