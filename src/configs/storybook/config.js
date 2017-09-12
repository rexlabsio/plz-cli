/*
|-------------------------------------------------------------------------------
| Storybook Modules Config
|-------------------------------------------------------------------------------
|
| Configures storybook for usage through plz-cli. It will grab the stories
| using a global loader bound to a pattern file, that defines what files
| the glob-loader should look for.
|
| This pattern file will be created dynamically, cause it will take this
| directory as its root, but we want the root to be in whatever context /package
| storybook gets initiated.
|
| Also we want to serve both the use from the root level as well as from
| component level.
|
| Why are we passing storybook in as an argument?
| -----------------------------------------------
| Because its the only way to keep the context of the configured storybook over
| dynamically collected stories.
|
| For easier use we do the same for plugins/addons. So you don't need to worry
| about pulling in anything on component level, you can simply fetch the addon
| you need from the second argument
*/

import * as storybook from '@storybook/react';
import { setOptions as setStorybookOptions } from '@storybook/addon-options';
import * as knobs from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { heidiAddon, withReadme } from '../../storybook-heidi-addon';
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
  const addons = {
    knobs,
    action
  };

  /*
  |-------------------------------------------------------------------------------
  | Per-story Setup
  |-------------------------------------------------------------------------------
  */
  // Load's all of the story modules, as well as the readme's (as raw strings)
  const stories = require('glob-loader!./stories.pattern');
  const readmes = require('glob-loader!./readmes.pattern');

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
