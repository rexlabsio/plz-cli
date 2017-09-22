/*
|-------------------------------------------------------------------------------
| App "theme"
|-------------------------------------------------------------------------------
|
| The theme of an app encompasses:
|  1. Design Rules
|  2. Style Utilities
|
| These are here so we can apply discipline to styling our app, and avoid
| spaghetti styling code.
|
*/

import { insertCss, reset, keyframes } from '@rexlabs/styling';

export const COLORS = {};
export const PADDINGS = {};
export const FONT = {};
export const BORDERS = {};
export const TRANSITIONS = {};
export const EASINGS = {};
export const SHADOWS = {};

export const LAYOUTS = {};
export const TEXTS = {};

export const UTILS = {
  truncate: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export const FRAMES = {
  fadeIn: keyframes({
    '0%': { opacity: 0 },
    '100%': { opacity: 1 }
  }),
  fadeOut: keyframes({
    '0%': { opacity: 1 },
    '100%': { opacity: 0 }
  })
};

export function initTheme () {
  reset();
  insertCss(`
    html {
      min-width: 1024px;
      font-size: 62.5% !important;
      height: 100%;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      box-sizing: border-box;
    }
    
    *, *:before, *:after {
      box-sizing: inherit;
    }
  `);
}
