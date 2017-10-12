/*
|-------------------------------------------------------------------------------
| Storybook command
|-------------------------------------------------------------------------------
|
| Starts a Storybook server for a rapid feedback loop during development of
| UI Components.
|
|  1. Build the webpack config is composed:
|    - Our own webpack configs for projects
|    - Storybook's own config, less our own overrides
|    - Storybook's own config, less our own overrides
|
| All we do here is doing some sanity checks before starting the storybook
| server. The main magic happens in `configs/storybook/config.js`.
|
| In order to make the glob-import work, we need to define a pattern file.
| As a hacked solution, since the pattern needs to be relative to the process
| root (process.cwd()), we generate this pattern file here on the fly, also
| considering that this script might be called from the root directory, in
| which case we want to grab all available stories from all packages.
|
*/

const chalk = require('chalk');
const pify = require('pify');
const fs = require('fs-extra');
const glob = pify(require('glob'));
const u = require('src/utils');
const loadCliConfig = require('src/utils/load-cli-config');
const {
  DEFAULT_PORT,
  PROJECT_TYPE_REACT_APP,
  PROJECT_TYPE_REACT_COMPONENT,
  PROJECT_TYPE_MODULE
} = require('src/utils/constants');

let tempFiles = [];

const STORYBOOK_SERVER_BIN_PATH = u.to(
  __dirname,
  '../../node_modules/.bin/storybook-server'
);
const STORYBOOK_BUILD_BIN_PATH = u.to(
  __dirname,
  '../../node_modules/.bin/build-storybook'
);
const STORYBOOK_CONFIG_PATH = u.to(__dirname, '../configs/storybook');
const STORYBOOK_ARGS = ['--config-dir', STORYBOOK_CONFIG_PATH];

// HACK: this pattern file is dynamically generated in order
// to serve both the requirements being called from root as well
// as from component level
const STORIES_PATTERN_PATH = u.to(
  __dirname,
  '../configs/storybook/stories.pattern'
);
const READMES_PATTERN_PATH = u.to(
  __dirname,
  '../configs/storybook/readmes.pattern'
);
// HACK: To customise Storybooks babel config, you must have a '.babelrc' file
// in the config directory. To avoid having to maintain this file, it's
// on the fly by us.
const STORYBOOK_BABELRC_PATH = u.to(__dirname, '../configs/storybook/.babelrc');
const MONOREPO_STORIES_GLOB_PATTERN = dir =>
  `${process.cwd()}/${dir}/*/src/.stories.js`;
const PACKAGE_STORIES_GLOB_PATTERN = `${process.cwd()}/src/.stories.js`;
const MONOREPO_READMES_GLOB_PATTERN = dir =>
  `${process.cwd()}/${dir}/*/readme.md`;
const PACKAGE_READMES_GLOB_PATTERN = `${process.cwd()}/readme.md`;

async function checkStorybookExists (binPath) {
  return u.accessBin(binPath).catch(err => {
    console.error(
      `Could not find storybook. Are you sure it has been installed in ${u.pkg
        .name}?\n${err.message}`
    );
    process.exit(1);
  });
}

async function isMonoRepoRoot (rootDir) {
  return fs.exists(`${process.cwd()}/${rootDir}`);
}

async function getStoriesGlobForCurrentDir (rootDir) {
  return (await isMonoRepoRoot(rootDir))
    ? MONOREPO_STORIES_GLOB_PATTERN(rootDir)
    : PACKAGE_STORIES_GLOB_PATTERN;
}

async function getReadmesGlobForCurrentDir (rootDir) {
  return (await isMonoRepoRoot(rootDir))
    ? MONOREPO_READMES_GLOB_PATTERN(rootDir)
    : PACKAGE_READMES_GLOB_PATTERN;
}

const PKG_HIGHLIGHT_RGX = rootDir =>
  new RegExp(`${rootDir}\\/([\\w-_]+)(.*)`, 'gi');
async function writePatternFile (rootDir) {
  const storiesGlobPattern = await getStoriesGlobForCurrentDir(rootDir);
  const readmesGlobPattern = await getReadmesGlobForCurrentDir(rootDir);
  u.debug('"storiesGlobPattern":     %o', storiesGlobPattern);
  u.debug('"readmesGlobPattern":     %o', readmesGlobPattern);
  await fs.writeFile(STORIES_PATTERN_PATH, storiesGlobPattern);
  tempFiles.push(STORIES_PATTERN_PATH);
  await fs.writeFile(READMES_PATTERN_PATH, readmesGlobPattern);
  tempFiles.push(READMES_PATTERN_PATH);
  return storiesGlobPattern;
}

async function writeBabelRc (projectType) {
  let babelConfig;
  switch (projectType) {
    case PROJECT_TYPE_REACT_APP:
      babelConfig = require('src/configs/project/app')({ isBaseOnly: true })
        .babel;
      break;
    case PROJECT_TYPE_REACT_COMPONENT:
    case PROJECT_TYPE_MODULE:
      babelConfig = require('src/configs/project/module')().babel;
      break;
    default:
      break;
  }
  const config = u.absolutifyBabel(babelConfig);
  await fs.writeFile(STORYBOOK_BABELRC_PATH, JSON.stringify(config, null, 2));
  tempFiles.push(STORYBOOK_BABELRC_PATH);
}

async function checkStoriesExists (rootDir, storiesGlobPattern) {
  const storyPaths = await glob(storiesGlobPattern);
  const storiesrootDir = `${rootDir}/`;
  if (storyPaths.length > 0) {
    const formatedPaths = storyPaths.map(p => u.cwdRel(p)).map(p => {
      return p.includes(storiesrootDir)
        ? p.replace(
          PKG_HIGHLIGHT_RGX(rootDir),
          `${u.muted(storiesrootDir)}$1${u.muted('$2')}`
        )
        : u.muted(p);
    });
    const storyText = formatedPaths.length > 1 ? 'stories' : 'story';
    console.log(` Loading ${storyText}:\n\n  ${formatedPaths.join('\n  ')}\n`);
  } else {
    const errLine = chalk.bold('Error: Could not find any stories.');
    const warnLine = 'Stories need to match one of the following patterns:';
    const otherLines = p => u.muted(u.cwdRel(p));
    console.error(
      ` ${errLine}\n\n ${warnLine}\n\n  ${otherLines(
        PACKAGE_STORIES_GLOB_PATTERN
      )}\n  ${otherLines(MONOREPO_STORIES_GLOB_PATTERN(rootDir))}`
    );
    process.exit(1);
  }
}

async function tempFilesClean () {
  for (let filePath in tempFiles) {
    if (await fs.exists(filePath)) {
      await fs.remove(filePath);
      u.debug('Removed temp story config: %o', filePath);
    }
  }
}

async function start ({ rootDir, outputDir }) {
  const { projectType } = loadCliConfig();
  await checkStoriesExists(rootDir, await writePatternFile(rootDir));
  await writeBabelRc(projectType);

  let command;
  if (outputDir) {
    /*
    |---------------------------------------------------------------------------
    | Build a static storybook app.
    |---------------------------------------------------------------------------
    */
    await checkStorybookExists(STORYBOOK_BUILD_BIN_PATH);
    const args = STORYBOOK_ARGS.concat(['--output-dir', u.to(outputDir)]).join(
      ' '
    );
    command = `${STORYBOOK_BUILD_BIN_PATH} ${args}`;
  } else {
    /*
    |---------------------------------------------------------------------------
    | Start a storybook server.
    |---------------------------------------------------------------------------
    */
    const detectPort = require('detect-port');
    await checkStorybookExists(STORYBOOK_SERVER_BIN_PATH);
    const port = await detectPort(DEFAULT_PORT);
    const args = STORYBOOK_ARGS.concat(['--port', port]).join(' ');
    command = `${STORYBOOK_SERVER_BIN_PATH} ${args}`;
  }

  u.debug('Storybook command: %O', command);
  const env = Object.assign({}, process.env, { STORYBOOK_CWD: process.cwd() });
  return u.exec(command, { env }).then(tempFilesClean);
}

module.exports = argv => {
  start(argv).catch(u.unhandledError);
};
