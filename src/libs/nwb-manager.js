/*
|-------------------------------------------------------------------------------
| NWB Manager
|-------------------------------------------------------------------------------
|
| Responsible for running, or aliasing to, NWB commands.
|
*/

const path = require('path');
const fse = require('fs-extra');
const u = require('./util');

const NWB_CLI_PATH = u.to(__dirname, '../../node_modules/.bin');
const NWB_CLI_BIN_PATH = path.resolve(NWB_CLI_PATH, 'nwb');
const NWB_DEFAULT_CONFIG_PATH = u.nwbConfigPath();
const NWB_OVERRIDING_CONFIG_PATH = 'nwb.config.js';

async function checkNwbExists () {
  return u.accessBin(NWB_CLI_BIN_PATH).catch(err => {
    console.error(
      `Could not find nwb. Are you sure it has been installed in ${u.pkg.name}?`
    );
    console.error(err);
    process.exit(1);
  });
}

async function getNwbConfigPath () {
  const hasOverridingConfig = await fse.pathExists(
    u.cwdTo(NWB_OVERRIDING_CONFIG_PATH)
  );

  return hasOverridingConfig
    ? NWB_OVERRIDING_CONFIG_PATH
    : NWB_DEFAULT_CONFIG_PATH;
}

async function prepareArgs (commandsArgv, envs = {}) {
  await checkNwbExists();

  const nwbConfigPath = await getNwbConfigPath();
  const args = commandsArgv.concat(['--config', nwbConfigPath]).join(' ');
  const command = `${NWB_CLI_BIN_PATH} ${args}`;
  u.debug('nwb command:', command);

  return [
    command,
    {
      env: Object.assign({}, process.env, envs)
    }
  ];
}

async function routeCommandToNwb (
  aliasedCommand,
  nwbCommand,
  nwbOptions,
  envs,
  logConfig
) {
  u.debug('alias command:', aliasedCommand);
  u.debug('alias config:', nwbOptions);
  const finalCommand = [nwbCommand].concat(nwbOptions || []);
  u.debug('real command:', finalCommand.join(' '));
  envs && u.debug('env vars:', envs);

  let execArgs = await prepareArgs(finalCommand, envs);
  if (logConfig) {
    execArgs = execArgs.concat([
      logConfig.progress,
      logConfig.succeed,
      logConfig.failed
    ]);
  }
  u.debug('nwb exec args:', execArgs);

  return u.exec.apply(null, execArgs);
}

async function showHelp () {
  await checkNwbExists();
  const command = `${NWB_CLI_BIN_PATH} --help`;

  console.log();
  console.log(`Showing help for ${u.cmd('nwb')}.`);
  console.log();
  return u.exec(command);
}

module.exports = {
  runNwbAlias: routeCommandToNwb,
  showHelp: showHelp
};
