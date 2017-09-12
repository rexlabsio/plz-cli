/*
|-------------------------------------------------------------------------------
| Test command
|-------------------------------------------------------------------------------
|
| Forwards arguments to Jest, a delightful javascript test runner.
|
*/

const path = require('path');
const chalk = require('chalk');
const u = require('../libs/util');

const JEST_CONFIG_PATH = path.resolve(
  __dirname,
  '../configs/jest/jest.config.js'
);
const JEST_BIN_PATH = u.to(__dirname, '../../node_modules/.bin/jest');
const COMMAND = 'test';

// We must make sure that babel-jest is used, since we don't want to
// have it as a devDependency for all packages using plz-cli.
u.debug('jest config path:\n', JEST_CONFIG_PATH);
const JEST_CONFIG_ARGS = ['--config', JEST_CONFIG_PATH];

function setupBrowserEnvForNode () {
  var jsdom = require('jsdom').jsdom;
  var exposedProperties = ['window', 'navigator', 'document'];
  global.document = jsdom('');
  global.window = document.defaultView;
  Object.keys(document.defaultView).forEach(property => {
    if (typeof global[property] === 'undefined') {
      exposedProperties.push(property);
      global[property] = document.defaultView[property];
    }
  });
}

global.navigator = {
  userAgent: 'node.js'
};

async function checkJestExists () {
  return u.accessBin(JEST_BIN_PATH).catch(err => {
    console.error(
      new Error(
        `Could not find jest. Are you sure it has been installed in ${u.pkg
          .name}?\n${err.message}`
      )
    );
    process.exit(1);
  });
}

async function runJestTests (jestArgs) {
  await checkJestExists();
  const args = jestArgs
    .concat(JEST_CONFIG_ARGS) // add custom jest config
    .join(' ');

  const command = `${JEST_BIN_PATH} ${args}`;

  return u.exec(command, { ignoreExits: true });
}

module.exports = () => {
  setupBrowserEnvForNode();

  const i = process.argv.findIndex(v => v === COMMAND);
  const restJestArgs = process.argv.slice(i + 1);
  u.debug('sliced jest args:', restJestArgs);

  runJestTests(restJestArgs).catch(u.unhandledError);
};
