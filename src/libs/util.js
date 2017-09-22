/*
|-------------------------------------------------------------------------------
| Util
|-------------------------------------------------------------------------------
|
| Util toolbelt.
|
*/

const pkg = require('../../package.json');
const pify = require('pify');
const fs = pify(require('fs'));
const childproc = require('child_process');
const path = require('path');
const debug = require('debug')('plz');
const chalk = require('chalk');
const ora = require('ora');
const _exec = pify(childproc.exec);

const getCliConfig = require('./parse-config');

const binName = Object.keys(pkg.bin)[0];
const logo = chalk.bold.magenta(`
              ___
             /\\_ \\
   _____     \\//\\ \\       ____
  /\\  __\`\\     \\ \\ \\     /\\_  \`\\
  \\ \\ \\L\\ \\     \\_\\ \\_   \\/_/  /_
   \\ \\  __/     /\\____\\    /\\____\\
    \\ \\ \\/      \\/____/    \\/____/
     \\ \\_\\
      \\/_/
`);
const underline = chalk.underline;
const italic = chalk.italic;
const bold = chalk.bold;
const muted = chalk.dim;
const error = chalk.bold.red;
const warn = chalk.yellow;
const header = chalk.blue;
const cmd = chalk.bold.yellow;
const req = chalk.magenta;
const opt = chalk.cyan;
const dotpoint = s => `  ◦ ${s}`;

function spinner (optionsOrText) {
  let options = {
    spinner: {
      interval: 120,
      frames: [
        chalk.green.bold('☱ '),
        chalk.green.bold('☲ '),
        chalk.green.bold('☴ ')
      ]
    }
  };
  if (typeof optionsOrText === 'string') {
    options.text = optionsOrText;
  } else if (typeof optionsOrText === 'object') {
    options = Object.assign({}, options, optionsOrText);
  }
  return ora(options);
}

/**
 * Checks access to a file.
 * @param {String} pathToFile - Path to the file.
 */
async function accessFile (pathToFile, fsMode = fs.R_OK) {
  return fs.access(pathToFile, fsMode);
}

/**
 * Checks access to an executable file.
 * @param {String} pathToBin - Path to the executable file.
 */
async function accessBin (pathToBin) {
  const name = path.basename(pathToBin);
  const dir = path.dirname(pathToBin);
  return accessFile(pathToBin, fs.X_OK).catch(() => {
    console.log();
    console.error(
      `${chalk.bold(
        `\nError: Could not find the ${name} executable at:`
      )}\n${dir}\n${chalk.yellow(
        `Tip: Make sure that ${pkg.name} has its dependencies installed.`
      )}`
    );
  });
}

function getPackageJson () {
  const filePath = cwdTo('package.json');
  let pkgObj = {};
  try {
    pkgObj = require(filePath);
  } catch (err) {}
  return pkgObj;
}

/**
 * @returns {plzConfigDefault}
 */
function loadCliConfig () {
  const pkgJsonObj = getPackageJson();
  return getCliConfig(pkgJsonObj);
}

const NWB_PROJECT_MAPPING = {
  undefined: 'react-components',
  module: 'react-components',
  'react-component': 'react-components',
  'react-app': 'react-apps'
};
function nwbConfigPath () {
  const type = loadCliConfig().type;
  return path.resolve(
    __dirname,
    `../configs/webpack/nwb.config.${NWB_PROJECT_MAPPING[type]}.js`
  );
}

const DEFAULT_EXEC_SPAWN_OPTIONS = {
  cwd: process.cwd()
};

function wrapLinesInError (header, lines) {
  const maxLength = lines
    .split('\n')
    .reduce((max, line) => (line.length > max ? line.length : max), 0);
  let head = `  ${header.toUpperCase()}  `;
  const top = muted(error('–'.repeat(maxLength - head.length)));
  const bottom = muted(error('–'.repeat(maxLength)));
  head = chalk.bold.bgRed.white(head);
  return `\n${head}${top}\n\n${lines.trim()}\n\n${bottom}\n`;
}

function exec (
  command,
  spawnOptions = {},
  spinnerText = '',
  spinnerSucceedText = 'Success!',
  spinnerFailText = 'Failed.'
) {
  const { ignoreExits } = spawnOptions;
  let spins = spinnerText ? spinner() : null;
  const stdioOptions = {
    stdio: spins ? 'pipe' : 'inherit'
  };
  spawnOptions = Object.assign(
    {},
    DEFAULT_EXEC_SPAWN_OPTIONS,
    stdioOptions,
    spawnOptions
  );
  spawnOptions.env = Object.assign(
    {},
    spawnOptions.env || process.env,
    // Chalk in child procs know to still use color
    process.stdout.isTTY ? { FORCE_COLOR: 'true' } : {}
  );
  return new Promise((resolve, reject) => {
    let args = command.split(' ');
    const cmd = args[0];
    const cmdBaseName = path.basename(cmd).replace(/\.\w+$/, '');
    args = args.slice(1);

    debug('spawning cmd:     ', cmd);
    debug('spawning args:    ', args);
    debug('spawning options: \n', spawnOptions);

    let outdump = '';
    const proc = childproc.spawn(cmd, args, spawnOptions);
    if (spins) {
      spins.text = spinnerText;
      spins.start(spinnerText);

      const onData = dat => {
        outdump += dat.toString();
      };
      proc.stdout && proc.stdout.on('data', onData);
      proc.stderr && proc.stderr.on('data', onData);
    } else {
      proc.stdout && proc.stdout.pipe(process.stdout);
      proc.stderr && proc.stderr.pipe(process.stderr);
    }
    const handleError = err => {
      debug(`error from ${cmdBaseName}:`, err);
      if (spinnerText) {
        spins.fail(spinnerFailText);
        console.log('');
      }
      unhandledError(err);
      if (spinnerText) {
        console.log(wrapLinesInError('Error Details', outdump));
      }
      process.exit(1);
    };
    proc.on('error', err => handleError(err));
    proc.on('close', code => {
      debug(`close code from ${cmdBaseName}:`, code);
      if (!ignoreExits && code > 0) {
        handleError(
          `The \`${path.basename(
            cmdBaseName
          )}\` command did not succeed - see details.`
        );
        reject(code);
      } else {
        if (spins) {
          spins.succeed(spinnerSucceedText);
        }
        resolve(code);
      }
    });
  });
}

const DEFAULT_EXEC_OUPUT_OPTIONS = {
  cwd: process.cwd()
};

function execGetOutput (command, execOptions = {}) {
  execOptions = Object.assign({}, DEFAULT_EXEC_OUPUT_OPTIONS, execOptions);

  debug('exec command:     ', command);
  debug('exec options: \n', execOptions);
  return _exec(command, execOptions);
}

function unhandledError (err) {
  console.error(`${error('Unhandled Error:')}`);
  console.error(err);
}

function escapeStringForShell (str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function getWriteError (dir) {
  return fs.access(path.join(dir, '../'), fs.W_OK).catch(() => false);
}

function trimLeft (str) {
  return str.replace(/^\s*/, '');
}

function loadYargsColors () {
  require('yargonaut')
    .style('cyan')
    .style('magenta', 'required')
    .style('blue', 'Help:')
    .style('blue', 'builds.')
    .helpStyle('blue')
    .errorsStyle('red');
}

function printCmd (cmd) {
  debug('external registerCommand:', cmd);
}

const nodeCliRegex = /.*node$/;
function get$0 () {
  const cliPath = process.argv
    .filter(arg => !nodeCliRegex.test(arg))
    .slice(process.execArgv)[0];
  let $0 = path.basename(cliPath);
  $0 = $0 === 'index.js' ? binName : $0;
  return $0;
}
const $0 = get$0(process.argv);

const cmdRegex = /^([\s\w-]+)?/;
const reqRegex = /<([a-zA-Z-]+)>/;
const optRegex = /\[([a-zA-Z-]+)]/;

function decorateCmd (str) {
  return str
    .replace(cmdRegex, `${cmd('$1')}`)
    .replace(reqRegex, `<${req('$1')}>`)
    .replace(optRegex, `[${opt('$1')}]`);
}

function decorateCliCmd (str) {
  return str
    .replace(reqRegex, `<${cmd('$1')}>`)
    .replace(optRegex, `[${opt('$1')}]`);
}

function prefixTerm (str) {
  return muted('$ ') + str;
}

/**
 * Registers commands to yargs in such a way that allows pretty printing.
 * @param {object} yargs - Yargs instance
 * @param {{command, file}|string} cmdConf - The registerCommand and file name, or just the registerCommand. Must not be styled.
 * @param {string} desc - Description of the registerCommand. Can be styled.
 * @param {function} [builder] - The yargs builder function for commands.
 * @param {function} [descMore] - Extra description for plz help <command>
 */
function registerCommand (yargs, cmdConf, desc, builder, descMore) {
  if (typeof builder === 'string') {
    descMore = builder;
    builder = undefined;
  }
  let cmdAndArgs;
  let cmdFileName;
  if (typeof cmdConf === 'object') {
    cmdAndArgs = cmdConf.command;
    cmdFileName = cmdConf.file;
  } else {
    cmdAndArgs = cmdConf;
    cmdFileName = cmdConf;
  }

  function commandHandler (argv) {
    debug(`running command '${cmdAndArgs}'`);
    const hit = argv._[0];
    const txt = `plz ${hit}`;
    console.log(muted(`${txt} v${pkg.version}\n`));

    // NOTE: Require the commands dynamically to dramatically improve bootup perf.
    require('../commands/' + cmdFileName)(argv);
  }

  function usageBuilder (yargs) {
    const commandUsage =
      '\n' +
      '  ' +
      prefixTerm(decorateCmd(`${$0} ${cmdAndArgs}`)) +
      '\n\n' +
      desc +
      (!descMore ? '' : '\n\n' + descMore);
    yargs.usage(commandUsage);
  }

  const actionableCommandConfig = {
    command: cmdAndArgs,
    handler: commandHandler,
    builder: yargs => {
      usageBuilder(yargs);
      if (builder) {
        builder(yargs);
      }
    }
  };

  // Register two commands; one that prints pretty to --help, but doesn't handle
  // the command, and another that handles the command and also register individual usage
  // NOTE: The 'print pretty' command never get's handled, because of the shell
  //       escape chars that proceed the real command text.
  if (process.stdout.isTTY) {
    debug(`register command inside TTY: ${cmdAndArgs}`);
    yargs.command(
      Object.assign(
        {
          desc: false // NOTE: Hides this command from being printed in --help
        },
        actionableCommandConfig
      )
    );

    yargs.command({
      command: decorateCmd(cmdAndArgs),
      desc: desc,
      builder: yargs => {
        if (builder) {
          builder(yargs);
        }
      }
    });

    // When we're not in a TTY session, only register a command once with non-styled
    // command text. This avoids doubling up on registered commands which can cause
    // hard to track bugs.
  } else {
    debug(`register command outside TTY: ${cmdAndArgs}`);
    yargs.command(Object.assign({ desc }, actionableCommandConfig));
  }
}

function registerOption (yargs, option, alias, desc, type) {
  const actionableConf = {};
  if (alias) actionableConf.alias = alias;
  if (type) actionableConf.type = type;
  if (desc) actionableConf.desc = muted(desc);

  yargs.option(option, actionableConf);
}

function to (...paths) {
  return path.resolve(...paths);
}

function cwdTo (...paths) {
  return to(process.cwd(), ...paths);
}

module.exports = {
  DEFAULT_PORT: 3000,

  // Console formatting helpers
  logo,
  $0,
  underline,
  italic,
  bold,
  muted,
  warn,
  error,
  header,
  cmd,
  req,
  opt,
  dotpoint,
  wrapLinesInError,
  decorateCmd,
  decorateCliCmd,
  prefixTerm,

  // Rest of utils
  registerCommand,
  registerOption,
  pkg,
  debug,
  spinner,
  getWriteError,
  to,
  cwdTo,
  accessFile,
  accessBin,
  loadCliConfig,
  nwbConfigPath,
  exec,
  execGetOutput,
  unhandledError,
  escapeStringForShell,
  trimLeft,
  printCmd,
  loadYargsColors
};
