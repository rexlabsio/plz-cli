import PropTypes from 'prop-types';
import PropVal from '@storybook/addon-info/dist/components/PropVal';

/*
|-------------------------------------------------------------------------------
| Storybook Config
|-------------------------------------------------------------------------------
*/
export function loadStorybookConfig () {
  // Because we're in the browser, this is now an object.
  return process.env.CLI_STORYBOOK_OPTIONS;
}

/*
|-------------------------------------------------------------------------------
| Fix PropVal Errors (internal storybook-info-addon component)
|-------------------------------------------------------------------------------
*/
export function fixPropValErrors () {
  // Fix PropVal.propTypes
  // https://github.com/storybooks/storybook/issues/1305
  PropVal.propTypes = Object.assign({}, PropVal.propTypes, {
    maxPropObjectKeys: PropTypes.number,
    maxPropArrayLength: PropTypes.number,
    maxPropStringLength: PropTypes.number
  });
}

/*
|-------------------------------------------------------------------------------
| Global CSS
|-------------------------------------------------------------------------------
*/
function insertCSSRules (id, rules) {
  const rulez = [].concat(rules);
  const styleEl = document.createElement('style');
  let styleSheet;

  // Append style element to head
  document.head.appendChild(styleEl);

  // Grab style sheet
  styleSheet = styleEl.sheet;

  rulez.forEach((rule, i) => {
    styleSheet.insertRule(rule, `${id}_${i}`);
  });
}

const MYERS_RESET = [
  `
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}`,
  `
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
  display: block;
}`,
  `
body {
  line-height: 1;
}`,
  `
ol, ul {
  list-style: none;
}`,
  `
blockquote, q {
  quotes: none;
}`,
  `
blockquote:before, blockquote:after,
q:before, q:after {
  content: '';
  content: none;
}`,
  `
table {
  border-collapse: collapse;
  border-spacing: 0;
}`
];

export function insertAppLikeGlobalCSS (child) {
  // NOTE: Disabled, because it interferes with styling of info-addon
  // insertCSSRules('reset', MYERS_RESET);
  insertCSSRules('reset', '*, *:before, *:after { box-sizing: border-box; }');
  return child();
}
