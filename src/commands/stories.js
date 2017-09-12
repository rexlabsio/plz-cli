/*
|-------------------------------------------------------------------------------
| Storybook command
|-------------------------------------------------------------------------------
|
| Starts a Storybook server for a rapid feedback loop during development of
| UI Components.
|
| All we do here is doing some sanity checks before starting the storybook
| server. The main magic happens in `configs/storybook/config.js`.
|
| In order to make the glob-import work, we need to define a pattern file.
| As a hacked soltion, since the pattern needs to be relative to the process
| root (process.cwd()), we generate this pattern file here on the fly, also
| considering that this script might be called from the root directory, in
| which case we want to grab all available stories from all packages.
|
*/

const chalk = require('chalk');
const pify = require('pify');
const path = require('path');
const fs = require('fs-extra');
const detectPort = require('detect-port');
const glob = pify(require('glob'));
const u = require('../libs/util');

const STORYBOOK_BIN_PATH = u.to(
  __dirname,
  '../../node_modules/.bin/storybook-server'
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
const MONOREPO_STORIES_GLOB_PATTERN = dir =>
  `${process.cwd()}/${dir}/*/src/.stories.js`;
const PACKAGE_STORIES_GLOB_PATTERN = `${process.cwd()}/src/.stories.js`;
const MONOREPO_READMES_GLOB_PATTERN = dir =>
  `${process.cwd()}/${dir}/*/readme.md`;
const PACKAGE_READMES_GLOB_PATTERN = `${process.cwd()}/readme.md`;

u.debug('storybook args:\n', STORYBOOK_ARGS);

async function checkStorybookExists () {
  return u.accessBin(STORYBOOK_BIN_PATH).catch(err => {
    console.error(
      `Could not find storybook. Are you sure it has been installed in ${u.pkg
        .name}?\n${err.message}`
    );
    process.exit(1);
  });
}

async function isMonoRepoRoot (rootPath) {
  return await fs.exists(`${process.cwd()}/${rootPath}`);
}

async function getStoriesGlobForCurrentDir (rootPath) {
  return (await isMonoRepoRoot(rootPath))
    ? MONOREPO_STORIES_GLOB_PATTERN(rootPath)
    : PACKAGE_STORIES_GLOB_PATTERN;
}

async function getReadmesGlobForCurrentDir (rootPath) {
  return (await isMonoRepoRoot(rootPath))
    ? MONOREPO_READMES_GLOB_PATTERN(rootPath)
    : PACKAGE_READMES_GLOB_PATTERN;
}

const PKG_HIGHLIGHT_RGX = rootPath =>
  new RegExp(`${rootPath}\\/([\\w-_]+)(.*)`, 'gi');
async function writePatternFile (rootPath) {
  const storiesGlobPattern = await getStoriesGlobForCurrentDir(rootPath);
  const readmesGlobPattern = await getReadmesGlobForCurrentDir(rootPath);
  u.debug('storiesGlobPattern:     ', storiesGlobPattern);
  u.debug('readmesGlobPattern:     ', readmesGlobPattern);
  await fs.writeFile(STORIES_PATTERN_PATH, storiesGlobPattern);
  await fs.writeFile(READMES_PATTERN_PATH, readmesGlobPattern);
  return storiesGlobPattern;
}

async function checkStoriesExists (rootPath, storiesGlobPattern) {
  const storyPaths = await glob(storiesGlobPattern);
  const storiesRootPath = `${rootPath}/`;
  if (storyPaths.length > 0) {
    const formatedPaths = storyPaths
      .map(p => path.relative(process.cwd(), p))
      .map(p => {
        return p.includes(storiesRootPath)
          ? p.replace(
            PKG_HIGHLIGHT_RGX(rootPath),
            `${u.muted(storiesRootPath)}$1${u.muted('$2')}`
          )
          : u.muted(p);
      });
    const storyText = formatedPaths.length > 1 ? 'stories' : 'story';
    console.log(` Loading ${storyText}:\n\n  ${formatedPaths.join('\n  ')}\n`);
  } else {
    const errLine = chalk.bold('Error: Could not find any stories.');
    const warnLine = 'Stories need to match one of the following patterns:';
    const otherLines = p => u.muted(path.relative(process.cwd(), p));
    console.error(
      ` ${errLine}\n\n ${warnLine}\n\n  ${otherLines(
        PACKAGE_STORIES_GLOB_PATTERN
      )}\n  ${otherLines(MONOREPO_STORIES_GLOB_PATTERN(rootPath))}`
    );
    process.exit(1);
  }
}

async function runStorybook ({ rootPath }) {
  await checkStorybookExists();
  await checkStoriesExists(rootPath, await writePatternFile(rootPath));

  const port = await detectPort(u.DEFAULT_PORT);
  const args = STORYBOOK_ARGS.concat(['--port', port]).join(' ');

  const command = `${STORYBOOK_BIN_PATH} ${args}`;

  return u.exec(command, {
    env: Object.assign({}, process.env, { STORYBOOK_CWD: process.cwd() })
  });
}

module.exports = argv => {
  runStorybook(argv).catch(u.unhandledError);
};
