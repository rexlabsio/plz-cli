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

import ExampleStories from './stories/example';

// Note: Ensure this is imported last, as it needs to inject styles last.
import { initTheme, TEXTS, LAYOUT, COMPONENTS } from 'src/theme';

const initBrowserEnv = _.once(initTheme);

function initStories (storybook, plugins) {
  storybook.addDecorator((story) => {
    initBrowserEnv();
    return (
      <StylesProvider components={COMPONENTS} debug={__DEV__}>
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
};
