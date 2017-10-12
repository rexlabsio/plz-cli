/*
|-------------------------------------------------------------------------------
| Jest Manager
|-------------------------------------------------------------------------------
|
| Responsible for running Jest commands.
|
*/

const path = require('path');
const u = require('src/utils');

const JEST_CLI_PATH = u.to(__dirname, '../../node_modules/.bin');
const JEST_CLI_BIN_PATH = path.join(JEST_CLI_PATH, 'jest');

async function checkJestExists () {
  return u.accessBin(JEST_CLI_BIN_PATH).catch(err => {
    console.error(
      `Could not find jest. Are you sure it has been installed in ${u.pkg
        .name}?`
    );
    console.error(err);
    process.exit(1);
  });
}

async function showHelp () {
  await checkJestExists();
  const command = `${JEST_CLI_BIN_PATH} --help`;

  console.log();
  console.log(`Showing help for ${u.cmd('jest')}.`);
  console.log();
  return u.exec(command);
}

module.exports = {
  showHelp: showHelp
};
