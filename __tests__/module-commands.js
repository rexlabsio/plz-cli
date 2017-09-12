const pify = require('pify');
const path = require('path');
const fs = pify(require('fs'));
const fse = require('fs-extra');
const { snapshotStdout, CLI_PATH, CLI_PROJECT_PATH } = require('./.utils');

const TEST_OUTPUT_PATH = path.resolve(CLI_PROJECT_PATH, '.test-output');
const PROJECT_NAME = 'test-module';
const PROJECT_PATH = path.resolve(TEST_OUTPUT_PATH, PROJECT_NAME);

describe('module (node)', () => {
  const DEFAULT_TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  const NEW_TIMEOUT_INTERVAL = 1000 * 120; // 120 seconds

  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = NEW_TIMEOUT_INTERVAL;
    await expect(fse.remove(PROJECT_PATH)).resolves.toBeUndefined();
    await expect(fse.ensureDir(PROJECT_PATH)).resolves.toBeTruthy();
  });
  afterAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = DEFAULT_TIMEOUT_INTERVAL;
    await expect(fse.remove(PROJECT_PATH)).resolves.toBeUndefined();
  });

  it('should create project', async () => {
    await snapshotStdout(CLI_PATH, [
      'create',
      PROJECT_NAME,
      TEST_OUTPUT_PATH,
      '--type',
      'module'
    ]);
    await expect(fs.readdir(PROJECT_PATH)).resolves.toMatchSnapshot();
  });

  it('should install deps in project', async () => {
    await snapshotStdout(
      'yarn',
      ['install', '--ignore-scripts', '--no-progress'],
      { cwd: PROJECT_PATH }
    );
    await expect(
      fs.readdir(path.resolve(PROJECT_PATH, './node_modules'))
    ).resolves.toBeTruthy();
  });

  it('should link current cli into project', async () => {
    await snapshotStdout('yarn', ['unlink'], { cwd: CLI_PROJECT_PATH });
    await snapshotStdout('yarn', ['link'], { cwd: CLI_PROJECT_PATH });
    await snapshotStdout('yarn', ['link', '@rexlabs/plz-cli'], {
      cwd: PROJECT_PATH
    });
  });

  it('should run valid test in project', async () => {
    await snapshotStdout('npm', ['run', 'test'], { cwd: PROJECT_PATH });
  });

  it('should build project', async () => {
    await snapshotStdout('npm', ['run', 'build'], { cwd: PROJECT_PATH });
    await expect(
      fs.readdir(path.resolve(PROJECT_PATH, 'lib'))
    ).resolves.toMatchSnapshot();
  });

  it('should clean project', async () => {
    await snapshotStdout('npm', ['run', 'clean'], { cwd: PROJECT_PATH });
    await expect(
      fs.readdir(path.resolve(PROJECT_PATH, 'lib'))
    ).rejects.toBeDefined();
  });

  // NOTE lochlan: I usually have the cli linked anyway, so I leave it linked.
  //               Sorry if this breaks something on your system.

  // it('should unlink current heidi-cli from machine', async () => {
  //   await snapshotStdout('yarn', ['unlink'], { cwd: CLI_PROJECT_PATH });
  // });
});
