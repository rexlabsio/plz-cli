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
const _ = require('lodash');
const changeCase = require('change-case');
const debug = require('debug')('plz');
const chalk = require('chalk');
const ora = require('ora');
const _exec = pify(childproc.exec);
const filesize = require('filesize');
const { sync: gzipSize } = require('gzip-size');

const plzRoot = path.resolve(__dirname, '../../');
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
const success = chalk.green;
const info = chalk.blue;
const header = chalk.blue;
const cmd = chalk.bold.yellow;
const req = chalk.magenta;
const opt = chalk.cyan;
const dotpoint = s => `  ◦ ${s}`;
const underpoint = s => `    ${s}`;
const deprecatePile = [];
const deprecate = s =>
  !deprecatePile.includes(s)
    ? deprecatePile.push(s) && `${chalk.black.bgYellow(' DEPRECATED ')} ${s}`
    : undefined;
const linkToReadme = () => warn('https://git.io/vdaQw');

function emoji (emojiChar, trailing = '  ', replacement = '') {
  if (!emojiChar) return replacement;
  return !process.argv.includes('--no-emoji')
    ? emojiChar + (trailing || '')
    : replacement;
}

function spinner (optionsOrText) {
  let options = {
    spinner: process.argv.includes('--no-emoji')
      ? ' '
      : {
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

let _argv;
function setGlobalArgv (argv) {
  if (argv.storybook) {
    // Hack: Make sure that nested args
    const keys = Object.keys(argv.storybook);
    _.forEach(keys, key => {
      const camelled = changeCase.camelCase(key);
      argv.storybook[camelled] = argv.storybook[key];
    });
  }

  _argv = argv;
  process.env.CLI_ARGV = JSON.stringify(_argv);
  debug('Set "globalArgv": %o', _argv);
}

function globalArgv () {
  return _argv || JSON.parse(process.env.CLI_ARGV || {});
}

let deprecations = [];
function pushDeprecation (msg) {
  deprecations.push(msg);
}

function logDeprecations () {
  if (deprecations.length) {
    deprecations.forEach(d => console.warn(deprecate(d)));
    console.log();
  }
}

function getPackageJson () {
  const filePath = cwdTo('package.json');
  let pkgObj = {};
  try {
    pkgObj = require(filePath);
  } catch (err) {}

  return pkgObj;
}

const DEFAULT_EXEC_SPAWN_OPTIONS = {
  cwd: process.cwd()
};

function wrapLinesInError (header, lines, isUpperCase = true) {
  const maxLength = process.stdout.columns;
  let head = `  ${isUpperCase ? header.toUpperCase() : header}  `;
  const top = muted(error('–'.repeat(maxLength - head.length)));
  const bottom = muted(error('–'.repeat(maxLength)));
  head = chalk.bold.bgRed.white(head);
  return `\n${head}${top}\n\n${lines.trim()}\n\n${bottom}\n`;
}

function clearConsole () {
  process.stdout.write(
    process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H'
  );
}

function exec (
  command,
  spawnOptions = {},
  spinnerText = '',
  spinnerSucceedText = 'Success!',
  spinnerFailText = 'Failed.',
  isSpinnerConstant = true
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
    // We need storybook-server etc to know our config.
    { CLI_ARGV: process.env.CLI_ARGV },
    // Chalk in child procs know to still use color.
    process.stdout.isTTY ? { FORCE_COLOR: 'true' } : {}
  );
  return new Promise((resolve, reject) => {
    let args = command.split(' ');
    const cmd = args[0];
    const cmdBaseName = path.basename(cmd).replace(/\.\w+$/, '');
    args = args.slice(1);

    debug('Spawning "cmd":\n%O', cmd);
    debug('Spawning "args":\n%O', args);
    debug('Spawning "options":\n%O', spawnOptions);

    let outdump = '';
    const proc = childproc.spawn(cmd, args, spawnOptions);
    if (spins) {
      spins.text = spinnerText;
      if (isSpinnerConstant) {
        spins.start(spinnerText);
      }

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
  execOptions.env = Object.assign(
    { CLI_ARGV: process.env.CLI_ARGV, HOME: process.env.HOME },
    execOptions.env || {}
  );

  debug('"execGetOutput" command: %o', command);
  debug('"execGetOutput" options: %o', execOptions);
  return _exec(command, execOptions);
}

function unhandledError (err) {
  console.log(`\n${error('Unhandled Error:')}`);
  console.error(err);
  process.exit(1);
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
    .style('blue', 'Project Config:')
    .style('blue', 'builds.')
    .helpStyle('blue')
    .errorsStyle('red');
}

function printCmd (cmd) {
  debug('External "registerCommand": %o', cmd);
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
    debug('Running command: %o', cmdAndArgs);
    const hit = argv._[0];
    const txt = `plz ${hit}`;
    console.log(muted(`${txt} v${pkg.version}`));
    console.log();
    logDeprecations();

    // NOTE: Require the commands dynamically to dramatically improve bootup perf.
    require('src/commands/' + cmdFileName)(argv);
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
    debug('Register command (TTY): %o', cmdAndArgs);
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
    debug('Register command: %o', cmdAndArgs);
    yargs.command(Object.assign({ desc }, actionableCommandConfig));
  }
}

function registerOption (
  yargs,
  option,
  alias,
  desc,
  type,
  Default,
  defaultDesc
) {
  const actionableConf = {};
  if (alias) actionableConf.alias = alias;
  if (type) actionableConf.type = type;
  if (desc) actionableConf.desc = muted(desc);
  if (Default) actionableConf.default = Default;
  if (defaultDesc) actionableConf.defaultDescription = defaultDesc;

  return yargs.option(option, actionableConf);
}

function to (...paths) {
  return path.resolve(...paths);
}

function cwdTo (...paths) {
  return to(process.cwd(), ...paths);
}

function cwdRel (p) {
  return path.relative(process.cwd(), p);
}

const namesToModulePaths = (prefix, paths) => {
  const REGEX_CLEAN_PREFIX = `^${prefix}`;
  return _.map(paths, name => {
    const moduleOpt = _.isArray(name) ? name[0] : name;
    const moduleName = `${prefix}${moduleOpt.replace(REGEX_CLEAN_PREFIX, '')}`;
    const modulePath = require.resolve(moduleName);
    return _.isArray(name) ? [modulePath, name[1]] : modulePath;
  });
};

const absolutifyBabel = config => {
  const conf = Object.assign({}, config);
  conf.presets = namesToModulePaths('babel-preset-', conf.presets);
  conf.plugins = namesToModulePaths('babel-plugin-', conf.plugins);
  return conf;
};

const FRIENDLY_SYNTAX_ERROR_LABEL = 'Syntax error:';
const s = n => (n === 1 ? '' : 's');

function formatMessage (message) {
  return (
    message
      // Make some common errors shorter:
      .replace(
        // Babel syntax error
        'Module build failed: SyntaxError:',
        FRIENDLY_SYNTAX_ERROR_LABEL
      )
      .replace(
        // Webpack file not found error
        /Module not found: Error: Cannot resolve 'file' or 'directory'/,
        'Module not found:'
      )
      // Webpack loader names obscure CSS filenames
      .replace(/^.*css-loader.*!/gm, '')
  );
}

function formatMessages (messages, type) {
  return messages.map(message => `${type} in ${formatMessage(message)}`);
}

function isLikelyASyntaxError (message) {
  return message.includes(FRIENDLY_SYNTAX_ERROR_LABEL);
}

function logErrorsAndWarnings (stats) {
  // Show fewer error details
  let json = stats.toJson({}, true);

  let formattedErrors = formatMessages(json.errors, error('Error'));
  let formattedWarnings = formatMessages(json.warnings, warn(' WARNING '));

  if (stats.hasErrors()) {
    let errors = formattedErrors.length;
    // let message = error(`Failed to compile with ${errors} error${s(errors)}.`);
    if (formattedErrors.some(isLikelyASyntaxError)) {
      // If there are any syntax errors, show just them.
      // This prevents a confusing ESLint parsing error preceding a much more
      // useful Babel syntax error.
      formattedErrors = formattedErrors.filter(isLikelyASyntaxError);
    }
    let message = formattedErrors.join('\n\n');
    console.log(
      wrapLinesInError(
        `Failed to compile with ${errors} error${s(errors)}.`,
        message,
        false
      )
    );
    return;
  }

  if (stats.hasWarnings()) {
    let warnings = formattedWarnings.length;
    console.log(warn(`Compiled with ${warnings} warning${s(warnings)}.`));
    formattedWarnings.forEach(message => {
      console.log();
      console.log(message);
    });
  }
}

function getFileDetails (stats) {
  let outputPath = stats.compilation.outputOptions.path;
  return Object.keys(stats.compilation.assets)
    .filter(assetName => /\.(css|js)$/.test(assetName))
    .map(assetName => {
      let size = gzipSize(stats.compilation.assets[assetName].source());
      return {
        dir: path.dirname(
          path.join(path.relative(process.cwd(), outputPath), assetName)
        ),
        name: path.basename(assetName),
        size,
        sizeLabel: filesize(size)
      };
    });
}

function logGzippedFileSizes (...stats) {
  let files = stats
    .reduce((files, stats) => files.concat(getFileDetails(stats)), [])
    .filter(({ name }) => !/^manifest\.[a-z\d]+\.js$/.test(name));

  let longest = files.reduce((max, { dir, name }) => {
    let length = (dir + name).length;
    return length > max ? length : max;
  }, 0);
  let pad = (dir, name) => Array(longest - (dir + name).length + 1).join(' ');

  console.log(`File size${s(files.length)} after gzip:`);
  console.log();

  files
    .sort((a, b) => b.size - a.size)
    .forEach(({ dir, name, size, sizeLabel }) => {
      const sizeKb = size / 1024;
      const sizeColor =
        sizeKb < 350 ? chalk.green : sizeKb < 800 ? chalk.yellow : chalk.red;
      console.log(
        `  ${chalk.dim(`${dir}${path.sep}`)}${chalk.bold(name)}` +
          `  ${pad(dir, name)}${sizeColor(sizeLabel)}`
      );
    });
}

function logBuildResults (stats, spinner, spinnerSucceedText, spinnerFailText) {
  if (stats.hasErrors()) {
    if (spinner) {
      spinner.stop(spinnerFailText);
      console.log();
    }
    logErrorsAndWarnings(stats);
  } else if (stats.hasWarnings()) {
    if (spinner) {
      spinner.stopAndPersist(warn('⚠'));
      console.log();
    }
    logErrorsAndWarnings(stats);
    console.log();
    logGzippedFileSizes(stats);
  } else {
    if (spinner) {
      spinner.succeed(spinnerSucceedText);
      console.log();
    }
    logGzippedFileSizes(stats);
  }
}

module.exports = {
  // Console formatting helpers
  logo,
  $0,
  emoji,
  underline,
  italic,
  bold,
  muted,
  warn,
  error,
  success,
  info,
  header,
  cmd,
  req,
  opt,
  dotpoint,
  underpoint,
  deprecate,
  linkToReadme,
  wrapLinesInError,
  pushDeprecation,
  logDeprecations,
  clearConsole,
  decorateCmd,
  decorateCliCmd,
  prefixTerm,

  // Rest of utils
  setGlobalArgv,
  globalArgv,
  registerCommand,
  registerOption,
  plzRoot,
  pkg,
  debug,
  spinner,
  getWriteError,
  to,
  cwdTo,
  cwdRel,
  getPackageJson,
  accessFile,
  accessBin,
  exec,
  execGetOutput,
  unhandledError,
  escapeStringForShell,
  trimLeft,
  printCmd,
  loadYargsColors,
  absolutifyBabel,
  logErrorsAndWarnings,
  logGzippedFileSizes,
  logBuildResults
};
