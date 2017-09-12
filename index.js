#! /usr/bin/env node

/*
|-------------------------------------------------------------------------------
| plz cli
|-------------------------------------------------------------------------------
|
| A toolkit for creating, building & testing packages.
|
| The CLI is largely a facade around other tools:
|  - nwb, by insin           (module bundler)
|  - jest, by facebook       (test runner)
|  - storybook, by community (development environment)
|
| By creating a facade around these tools, we can:
|  - Avoid forcing developer to learn & remember individual tools
|  - Replace the tools without changing the front-facing API
|  - Optimize heidi package's output over time, without many refactor costs
|
*/

if (require.main !== module) {
  // We treat the file as a module when require'd, to share configs around
  const u = require('./src/libs/util');
  module.exports = {
    nwbConfig: require(u.nwbConfigPath()),
    initStoryshots: function initStoryshots () {
      const initStoryshotTest = require('@storybook/addon-storyshots').default;
      const configDirPath = require('path').resolve(
        __dirname,
        'src/configs/storybook/storyshots'
      );
      initStoryshotTest({
        configPath: configDirPath,
        // For some reason storyshots check for @storybook/react
        // dependency fails sometimes, so we force that here
        framework: 'react'
      });
    }
  };
} else {
  // Otherwise, we execute this file as a CLI
  const cli = require('./src/cli-init');
  const u = require('./src/libs/util');

  // Start CLI
  const command = cli.loadCliCommands();
  u.debug('argv:', command.argv);
  cli.parseCommand(command);
}
