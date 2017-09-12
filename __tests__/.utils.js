const { defaultsDeep } = require('lodash');
const pify = require('pify');
const path = require('path');
const fs = pify(require('fs'));
const _spawn = require('child_process').spawn;

it('empty', () => expect(true).toBe(true));

const CLI_PROJECT_PATH = path.resolve(__dirname, '../');
const CLI_PATH = path.resolve(CLI_PROJECT_PATH, 'index.js');

function spawn(cmd, args, options, onStdout, onStderr) {
  return new Promise((resolve, reject) => {
    const cli = _spawn(cmd, args, options);
    cli.stdout.on('data', dat => onStdout(dat.toString()));
    cli.stderr.on('data', dat => onStderr(dat.toString()));
    cli.on('close', resolve);
    cli.on('error', reject);
  });
}

const timersRegex = /(\d+\.)?\d+m?s/g;
const versionsRegex = /v\d+\.\d+\.\d+/g;
const plzDirRegex = new RegExp(CLI_PROJECT_PATH.replace('/', '/'), 'gi');
const unmetPeerDepWarningRegex = /warning.*has unmet peer dep.*/gi;
function stripNonDeterministicStrings(str) {
  return str
    .replace(timersRegex, '<TIMESTAMP>')
    .replace(versionsRegex, '<VERSIONSTAMP>')
    .replace(plzDirRegex, '<CLI_DIR>')
    .replace(unmetPeerDepWarningRegex, '<UNMET PEER DEP WARNING>');
}

async function snapshotStdout(cmd, args, options = {}, isPrinting) {
  let stdoutDump = '';
  let stderrDump = '';
  expect(
    stripNonDeterministicStrings(
      `cmd: ${cmd} ${args} ${JSON.stringify(options)}`
    )
  ).toMatchSnapshot();

  await spawn(
    cmd,
    args,
    options,
    data => {
      stdoutDump += data;
      isPrinting && console.log(data);
    },
    data => {
      stderrDump += data;
      isPrinting && console.log(data);
    }
  );

  expect(
    `stdoutDump:\n${stripNonDeterministicStrings(stdoutDump)}`
  ).toMatchSnapshot();
  expect(
    `stderrDump:\n${stripNonDeterministicStrings(stderrDump)}`
  ).toMatchSnapshot();
}

module.exports = {
  CLI_PROJECT_PATH,
  CLI_PATH,
  snapshotStdout
};
