/*
|-------------------------------------------------------------------------------
| App "Theme" for Internal Components
|-------------------------------------------------------------------------------
|
| These theming configurations are suppose to be consumed by `element-style`s
| "StylesProvider". See https://git.io/vNyT4 for more details.
|
| They are kept in a separate module, so we can do fine-grained import-order for
| the App as well as for Storybook Stories.
|
*/

import { StyleSheet } from '@rexlabs/styling';
import * as CONSTANTS from 'theme';

const ELEMENT_STYLE_COMPONENTS = {
  /*
  |
  |            EXAMPLE
  |       -----------------
  |
  |     'Button': StyleSheet({
  |       container: {
  |         border: 'solid 5px black'
  |       },
  |       text: {
  |         color: 'white'
  |       }
  |     })
  |
  */
};

export default ELEMENT_STYLE_COMPONENTS;
