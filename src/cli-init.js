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
    process.reallyExit(0);
  }

  /* Load modules when we hit the hot code. */
  const chalk = require('chalk');
  const {
    PROJECT_TYPE_REACT_APP,
    PROJECT_TYPE_REACT_COMPONENT,
    PROJECT_TYPE_MODULE
  } = require('src/utils/constants');
  const u = require('src/utils');
  u.loadYargsColors();
  const yargs = require('yargs');
  u.setGlobalArgv(yargs.argv);

  /*
  |--------------------------------------
  | CLI Usage
  |--------------------------------------
  */
  const usageLines = [
    u.logo,
    ` ${u.prefixTerm(u.decorateCliCmd(u.$0 + ' <command> [options]', true))}`,
    u.pkg.description
  ];
  yargs.usage(usageLines.join('\n\n'));

  /*
  |--------------------------------------
  | CLI Commands
  |--------------------------------------
  */
  const templates = [
    PROJECT_TYPE_MODULE,
    PROJECT_TYPE_REACT_APP,
    PROJECT_TYPE_REACT_COMPONENT
  ];
  const defaultTempalate = PROJECT_TYPE_REACT_COMPONENT;
  const templateList = templates
    .map(
      template =>
        `${u.dotpoint(u.underline(template))}\n${u.underpoint(
          u.muted(`--project-type=${template}`)
        )}\n`
    )
    .join('\n');
  u.registerCommand(
    yargs,
    { command: 'create <name> [root-dir]', file: 'create' },
    `Generates a project called ${u.bold('`')}${u.muted(
      `${u.pkg.name.split('/')[0]}/`
    )}${chalk.reset('<')}${chalk.magenta('name')}${chalk.reset('>')}${u.bold(
      '`'
    )}.`,
    yargs => {
      u.registerOption(
        yargs,
        'project-type',
        't',
        'Type of project',
        undefined,
        defaultTempalate
      );

      u.registerOption(
        yargs,
        'root-dir',
        null,
        'Root directory',
        'string',
        process.cwd(),
        'Current directory'
      );
    },
    'The following project types are available:\n\n' +
      templateList +
      '\n' +
      'Project templates use handlebars to generate directories and files.'
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
        .options('root-dir', {
          type: 'string',
          default: 'components',
          describe: 'Directory to search in, for multiple package stories.'
        })
        .options('output-dir', {
          type: 'string',
          describe: 'Directory to build & output a static storybook app.'
        }),
    'Storybook is an interactive development & testing environment for React ' +
      'Components. Its \'stories\' are also used for snapshot testing.\n\n' +
      `The Storybook app can be built into a static site by using the ${u.bold(
        '--output-dir'
      )} argument.`
  );

  u.registerCommand(yargs, 'serve', 'Starts an dev server for the project.');

  u.registerCommand(
    yargs,
    'build',
    'Bundles a project for distribution.',
    `A ${u.bold('package')} will be bundled for two kinds of module systems:

${[
    'commonjs > require | For the `main` field of package.json.',
    'es module > import | For the `modules` field of package.json.'
  ]
    .map(line => {
      const [point, under] = line.split(' | ');
      const [first, method] = point.split(' > ');
      return `${u.dotpoint(
        `${first} ${u.muted(`(${u.underline(method)})`)}`
      )}\n${u.underpoint(u.muted.italic(under))}`;
    })
    .join('\n')}`
  );

  u.registerCommand(yargs, 'clean', 'Removes previously built files.');

  /*
  |--------------------------------------
  | Help Commands
  |--------------------------------------
  */
  u.registerCommand(yargs, { command: 'help' }, 'Shows this help message.');
  u.registerOption(yargs, 'help', 'h', 'Show help', 'boolean');
  u.registerOption(yargs, 'help-all', null, 'Show all help', 'boolean');

  /*
  |-------------------------------------------------------------------------------
  | Options
  |-------------------------------------------------------------------------------
  */

  u.registerOption(yargs, 'version', 'v', 'Show cli version number', 'boolean');

  yargs
    .command({ command: 'help-all', desc: false })
    .command({ command: 'help-jest', desc: false })
    .group(['help', 'help-all'], 'Help:')
    .help('help', u.muted('Show help'))
    .epilog(
      `Run \`${u.underline(
        u.decorateCliCmd(`${u.$0} help <command>`)
      )}\` for more info & options.`
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
  const u = require('src/utils');
  const changeCase = require('change-case');

  if (hasHitImplicitCommand(cli, 'help-all')) {
    const _ = require('lodash');
    u.debug('Hit help-all');

    u.registerOption(cli, 'help-jest', null, 'Show help for jest', 'boolean');
    cli.group(['help', 'help-all', 'help-jest'], 'Help:');
    u.registerOption(
      cli,
      'no-timestamp',
      null,
      'Disable cli timestamp',
      'boolean'
    );
    u.registerOption(cli, 'no-emoji', null, 'Disable emoji', 'boolean');
    u.registerOption(
      cli,
      'report',
      null,
      'Show cli runtime reports',
      'boolean'
    );

    let projArgs = [];
    const registerProjArg = (val, key) => {
      const arg = changeCase.param(key);
      projArgs.push(arg);
      u.registerOption(
        cli,
        arg,
        null,
        changeCase.sentence(key),
        val != null ? typeof val : 'string'
      );
    };

    // Format all the storybook optional commands as: --storybook-<some-option>
    _.forEach(require('src/configs/project-defaults/base'), (val, key) => {
      if (key === 'storybook') {
        _.forEach(val, (x, y) => registerProjArg(x, `${key}-${y}`));
      } else {
        registerProjArg(val, key);
      }
    });
    cli.group(projArgs, 'Project Config:');
    cli.showHelp();
    return;
  }

  if (hasHitImplicitCommand(cli, 'help-jest')) {
    u.debug('Hit help-jest');
    const jest = require('src/utils/jest-manager');
    jest.showHelp().then(() => {
      process.exit(0);
    });
    return;
  }

  const currentCommand = cli.argv._[0] || '';
  const availableCommands = cli.getCommandInstance().getCommands();
  u.debug('Parsed command: %o', currentCommand);
  u.debug('Parsed avail commands: %o', availableCommands);

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
    process.exit(0);
  }
}

module.exports = {
  loadCliCommands,
  parseCommand
};
