/*
|-------------------------------------------------------------------------------
| Storybook Modules Config for Storyshots
|-------------------------------------------------------------------------------
|
| NOTE: This is a hacked solution! Ideally we can usify the configs.
| Should be ok if we run the `createPatternFile` method on test as well
| + make sure we also load in plz's node modules for glob-loader...
|
| Why a seperate config
| ---------------------
| To work nice with storyshot and plz's jest setup. Had trouble getting
| glob-loader to work, so I took this short cut for now...
|
| ~stories is defined as an alias to the "callers" `./src/.stories.js`
| file in the jest config. The rest is copy-pasta from the main
| storybook config!
*/

import * as storybook from '@storybook/react';
import * as knobs from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { heidiAddon } from '../addons/heidi-addon';
heidiAddon.isStoryShot = true; // Used to signal to addons to avoid noisy code/render paths.

// Adds the '.addStory(storyConfig)' api to storybook
storybook.setAddon(heidiAddon);

const addons = {
  knobs,
  action
};

function loadStories () {
  const stories = require('~stories').default;

  // Setup each story to have a readme in it, when available, regardless of if
  // the consumer uses a HeidiStorybook.
  const storiesOf = name =>
    storybook.storiesOf(name, module).addDecorator(knobs.withKnobs);

  const _storybook = Object.assign({}, storybook, { storiesOf });
  stories(_storybook, addons);
}

storybook.configure(loadStories, module);
