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

export function insertAppLikeGlobalCSS (child) {
  insertCSSRules('reset', '*, *:before, *:after { box-sizing: border-box; }');
  return child();
}
