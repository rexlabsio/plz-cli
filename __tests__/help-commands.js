const { snapshotStdout, CLI_PATH } = require('./.utils');

describe('cli', () => {
  it('should show usage details', async () => {
    await snapshotStdout(CLI_PATH, ['help']);
  });

  it('should show usage details for create', async () => {
    await snapshotStdout(CLI_PATH, ['help', 'create']);
  });

  it('should show usage details for build', async () => {
    await snapshotStdout(CLI_PATH, ['help', 'build']);
  });

  it('should show usage details for serve', async () => {
    await snapshotStdout(CLI_PATH, ['help', 'serve']);
  });

  it('should show usage details for clean', async () => {
    await snapshotStdout(CLI_PATH, ['help', 'clean']);
  });

  it('should show usage details for test', async () => {
    await snapshotStdout(CLI_PATH, ['help', 'test']);
  });
});
