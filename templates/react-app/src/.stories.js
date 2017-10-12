/*
|-------------------------------------------------------------------------------
| Storybook Stories
|-------------------------------------------------------------------------------
|
| In your terminal, run `yarn storybook`
|
| In larger apps, this file can become the index of other stories, imported from
| directories like "src/stories".
|
*/

import 'utils/globals';
import _ from 'lodash';
import React from 'react';
import { StylesProvider } from '@rexlabs/styling';
import { LayoutProvider } from '@rexlabs/box';
import { TextProvider } from '@rexlabs/text';
import { initTheme, TEXTS, LAYOUT } from 'src/theme';

import ExampleStories from './stories/example';

// Note: Ensure this is imported last, as it needs to inject styles last.
import ELEMENT_STYLE_COMPONENTS from 'src/theme-components';

function _initBrowserEnv() {
  const fontLink = document.createElement('link');
  fontLink.setAttribute(
    'href',
    'https://fonts.googleapis.com/css?family=Lato:300,400,700,900'
  );
  fontLink.setAttribute('rel', 'stylesheet');

  initTheme();
  document.head.append(fontLink);
}
const initBrowserEnv = _.once(_initBrowserEnv);

function initStories(storybook, plugins) {
  storybook.addDecorator(story => {
    initBrowserEnv();
    return (
      <StylesProvider components={ELEMENT_STYLE_COMPONENTS} debug={__DEV__}>
        <LayoutProvider layout={LAYOUT}>
          <TextProvider text={TEXTS}>{story()}</TextProvider>
        </LayoutProvider>
      </StylesProvider>
    );
  });
  ExampleStories(storybook, plugins);
}

export default (storybook, plugins) => {
  initStories(storybook, plugins);
}
