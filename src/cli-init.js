/*
|-------------------------------------------------------------------------------
| CLI Module
|-------------------------------------------------------------------------------
|
| Responsible for handling the loading and parsing of CLI commands.
|
| Note:
|  Modules are required inside the functions to avoid running them until
|  cli commands are being reached.
|
*/

function loadCliCommands () {
  /* Quick print version. Note: Avoids loading config, which can add ~500ms */
  if (process.argv.includes('--version') || process.argv.includes('-v')) {
    console.log(require('../package').version);
    process.exit(0);
  }

  /* Load modules when we hit the hot code. */
  const chalk = require('chalk');
  const u = require('./libs/util');
  u.loadYargsColors();
  /** @type yargs.Argv */
  const yargs = require('yargs');

  /*
  |--------------------------------------
  | CLI Usage
  |--------------------------------------
  */
  const usageLines = [
    u.logo,
    `  ${u.prefixTerm(u.decorateCliCmd(u.$0 + ' <command> [options]', true))}`,
    u.pkg.description
  ];
  yargs.usage(usageLines.join('\n\n'));

  /*
  |--------------------------------------
  | CLI Commands
  |--------------------------------------
  */
  const templates = ['module', 'react-app', 'react-component'];
  const defaultTempalate = 'react-component';
  const templateList = templates
    .map(template => `${u.dotpoint(u.underline(template))}`)
    .join('\n');
  u.registerCommand(
    yargs,
    { command: 'create <name> [root-path]', file: 'create' },
    `Generates a package/app called ${u.bold('`')}${u.muted(
      `${u.pkg.name.split('/')[0]}/`
    )}${u.bold('<name>')}${u.bold('`')}.`,
    yargs =>
      yargs
        .options({
          type: {
            default: defaultTempalate,
            describe: 'Type of Package'
          },
          'root-path': {
            type: 'string',
            describe: 'Root path',
            default: process.cwd(),
            defaultDescription: 'Current directory'
          }
        })
        .check(function (argv) {
          if (templates.includes(argv.type)) {
            return true;
          } else {
            throw new Error(
              u.wrapLinesInError(
                'Usage Error',
                `${chalk.red(
                  `The type give to \`${u.muted.white(
                    `--type=${argv.type}`
                  )}\` was invalid.`
                )}\n\nUse one of the following:\n\n${templateList}`
              )
            );
          }
        }),
    'The following package \'types\' are available:\n\n' +
      templateList +
      '\n\n' +
      'Package templates use handlebars to generate directories and files.'
  );

  u.registerCommand(
    yargs,
    { command: 'test [options]', file: 'test' },
    'Starts a test runner in current directory.',
    yargs =>
      yargs.options('watch', {
        type: 'boolean',
        default: false,
        describe: 'Rerun tests when files change.'
      }),
    'Jest is used to run tests and perform assertions. All args are passed to jest.\n' +
      'See https://facebook.github.io/jest/docs/en/api.html for more details.'
  );

  u.registerCommand(
    yargs,
    'stories',
    'Starts a storybook for UI components.',
    yargs =>
      yargs
        .options('root-path', {
          type: 'string',
          default: 'components',
          describe: 'Directory to search in, for multiple package stories.'
        })
        .options('output-path', {
          type: 'string',
          describe: 'Directory to build & output a static storybook app.'
        }),
    'Storybook is an interactive development & testing environment for React ' +
      'Components. Its \'stories\' are also used for snapshot testing.\n\n' +
      `The Storybook app can be built into a static site by using the ${u.bold(
        '--output-path'
      )} argument.`
  );

  u.registerCommand(
    yargs,
    'build',
    'Bundles a package for distribution.',
    'Uses nwb to build two kinds of modules for distribution: cjs and es.'
  );

  u.registerCommand(
    yargs,
    'serve',
    'Starts a demo for UI components.',
    'Uses nwb to start a webpack server with Hot Module Replacement.'
  );

  u.registerCommand(yargs, 'clean', 'Removes previous build files.');

  /*
  |--------------------------------------
  | Help Commands
  |--------------------------------------
  */
  u.registerCommand(yargs, { command: 'help' }, 'Shows this help message.');
  u.registerOption(yargs, 'help', 'h', 'Show help', 'boolean');
  u.registerOption(yargs, 'help-nwb', null, 'Show help for nwb', 'boolean');
  u.registerOption(yargs, 'help-jest', null, 'Show help for jest', 'boolean');
  u.registerOption(yargs, 'version', 'v', 'Show cli version number', 'boolean');
  yargs
    .command({ command: 'help-nwb', desc: false })
    .command({ command: 'help-jest', desc: false })
    .group(['help', 'help-nwb', 'help-jest', 'version'], 'Help:')
    .help('help', u.muted('Show help'))
    .epilog(
      `Run \`${u.underline(
        u.decorateCliCmd(`${u.$0} help <command>`)
      )}\` for more information on specific commands.`
    )
    .showHelpOnFail(true)
    .version('version', u.muted('Show cli version number'), u.pkg.version);

  return yargs;
}

function hasHitImplicitCommand (cli, cmd) {
  return cli.argv._.includes(cmd) || cli.argv[cmd];
}

function parseCommand (cli) {
  /* Load modules when we hit the hot code. */
  const u = require('./libs/util');
  const nwb = require('./libs/nwb-manager');

  if (hasHitImplicitCommand(cli, 'help-nwb')) {
    u.debug('hit help-nwb');
    nwb.showHelp().then(() => {
      process.exit(1);
    });
    return;
  }
  if (hasHitImplicitCommand(cli, 'help-jest')) {
    u.debug('hit help-jest');
    const jest = require('./libs/jest-manager');
    jest.showHelp().then(() => {
      process.exit(1);
    });
    return;
  }

  const currentCommand = cli.argv._[0] || '';
  const availableCommands = cli.getCommandInstance().getCommands();
  u.debug('parsed command:', currentCommand);
  u.debug('parsed avail commands:', availableCommands);

  // HACK: Not sure why, but if yargs is handling a command, then the getCommands()
  //       function doesn't return any array entries...
  const isHandlingCommandInternally = availableCommands.length === 0;
  const requestedValidCommand = availableCommands.includes(currentCommand);
  if (!isHandlingCommandInternally && !requestedValidCommand) {
    const hadProvidedCommand = cli.argv._.length > 0;
    const prefix = hadProvidedCommand ? 'Couldn\'t match command. ' : '';
    const highlight = hadProvidedCommand ? u.error : u.italic;
    cli.showHelp();
    console.error(
      highlight(`${prefix}Use one of the listed commands to begin.`)
    );
    process.exit(1);
  }
}

module.exports = {
  loadCliCommands,
  parseCommand
};
