#! /usr/bin/env node

/*
|-------------------------------------------------------------------------------
| plz cli
|-------------------------------------------------------------------------------
|
| A toolkit for creating, building & testing packages & apps.
|
| The CLI is largely a facade around other tools:
|  - webpack                 (module bundler)
|  - jest, by facebook       (test runner)
|  - storybook, by community (development environment)
|
| By creating a facade around these tools, we can:
|  - Avoid forcing developer to learn & remember individual tools
|  - Replace the tools without changing the front-facing API
|  - Optimize heidi package's output over time, without many refactor costs
|
*/

const startTime = +new Date();
process.env.CLI_START_TIME = startTime;
if (require.main !== module) {
  // We treat the file as a module when require'd, to share configs around
  module.exports = {
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
  const loadCliConfig = require('./src/utils/load-cli-config');
  const Reporting = require('./src/utils/reporting');

  // Setup reporting
  const reporting = new Reporting(startTime);

  // Register exit hook
  process.on('exit', () => {
    const u = require('./src/utils');
    reporting.stop();
    const { totalTime, peakMB } = reporting.report();
    totalTime &&
      console.log(
        `\n${u.emoji('🙏')}Done in ${(totalTime / 1000).toFixed(2)}s.`
      );
    peakMB && console.log(`${u.emoji('🖥')}Peak memory usage ${peakMB}MB`);
  });

  // Start CLI
  Promise.resolve(
    (async () => {
      const command = cli.loadCliCommands();
      loadCliConfig();
      cli.parseCommand(command);
    })()
  )
    .then()
    .catch(err => {
      console.log(`\n${require('chalk').red('Unhandled Error:')}`);
      console.error(err);
      process.exit(1);
    });
}
