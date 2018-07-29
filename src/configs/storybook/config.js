/*
|-------------------------------------------------------------------------------
| Storybook Modules Config
|-------------------------------------------------------------------------------
|
| Configures storybook for usage through plz-cli's commands and configuration.
|
|  1. Finds all stories dynamically
|    a. Stories modules are loaded with a glob pattern.
|    b. `readme.md`s of packages with stories are loaded raw.
|  3. Each story is loaded & decorated with addons to improve DX
|
|
| Why are we modifying the storybook instance?
| -----------------------------------------------
| Although the DX of storybook is 👌, we want to extend it's capabilities by
| pushing our package's readme's into each set of stories, as well as improving
| the appearance & alignment of a story's space.
|
| Common addons are also added so that we don't have to import them per
| .story.js, and keep the maintenance costs of versioning to a bulk-minimum.
|
| Why are we using glob-loader?
| -----------------------------------------------
| Although we could be using webpack's require.context, or import(), we instead
| use glob-loader because it fit our performance requirements.
|
| How are stories loaded for an entire monorepo?
| -----------------------------------------------
| We want to enable plz to serve an entire monorepo's collection of component
| packages. To do this we check the structure of the working directory; when
| conditions satisfied, we generate a glob pattern that best suits monorepos.
*/

import * as storybook from '@storybook/react';
import { setOptions as setStorybookOptions } from '@storybook/addon-options';
import * as knobs from '@storybook/addon-knobs';
import * as a11y from '@storybook/addon-a11y';
import { action } from '@storybook/addon-actions';
import { heidiAddon, withReadme } from './addons/heidi-addon';
import {
  loadStorybookConfig,
  insertAppLikeGlobalCSS,
  fixPropValErrors
} from './stories-env';

function loadStories () {
  /*
  |-------------------------------------------------------------------------------
  | Global Setup
  |-------------------------------------------------------------------------------
  */
  fixPropValErrors();
  setStorybookOptions(loadStorybookConfig());
  // Adds the '.addStory(storyConfig)' api to storybook
  storybook.setAddon(heidiAddon);
  const addons = { knobs, action, a11y };

  /*
  |-------------------------------------------------------------------------------
  | Per-story Setup
  |-------------------------------------------------------------------------------
  */
  // Load's all of the story modules, as well as the readme's (as raw strings)
  const stories = require('glob-loader!./stories.pattern');
  const readmes = require('raw-loader!glob-loader!./readmes.pattern');

  // Go over each story module, to invoke it's default export with:
  //  1. A simplified storybook API, called HeidiStorybook.
  //  2. The storybook object, in case it's needed.
  //  3. An object of all the addons being used.
  function setupEachStory (modulePath) {
    const packageReadmePath = modulePath.replace(
      'src/.stories.js',
      'readme.md'
    );
    const readme = readmes[packageReadmePath];

    // Setup each story to have a readme in it, when available, regardless of if
    // the consumer uses a HeidiStorybook.
    const storiesOf = (name, ...args) => {
      if (!args[0]) args[0] = module;
      let story = storybook.storiesOf(name, ...args);
      story.addDecorator(insertAppLikeGlobalCSS);
      if (readme) {
        story = story.addDecorator(withReadme(readme));
      }
      story = story.addDecorator(knobs.withKnobs);
      return story;
    };

    const _storybook = Object.assign({}, storybook, { storiesOf });
    stories[modulePath].default(_storybook, addons);
  }

  Object.keys(stories).forEach(setupEachStory);
}

storybook.configure(loadStories, module);
