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
const MONOREPO_STORIES_GLOB_PATTERN = `${process.cwd()}/packages/*/src/.stories.js`;
const PACKAGE_STORIES_GLOB_PATTERN = `${process.cwd()}/src/.stories.js`;
const MONOREPO_READMES_GLOB_PATTERN = `${process.cwd()}/packages/*/readme.md`;
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

async function isMonoRepoRoot () {
  return await fs.exists(`${process.cwd()}/packages`);
}

async function getStoriesGlobForCurrentDir () {
  return (await isMonoRepoRoot())
    ? MONOREPO_STORIES_GLOB_PATTERN
    : PACKAGE_STORIES_GLOB_PATTERN;
}

async function getReadmesGlobForCurrentDir () {
  return (await isMonoRepoRoot())
    ? MONOREPO_READMES_GLOB_PATTERN
    : PACKAGE_READMES_GLOB_PATTERN;
}

const PKG_HIGHLIGHT_RGX = /packages\/([\w-_]+)(.*)/gi;
async function writePatternFile () {
  const storiesGlobPattern = await getStoriesGlobForCurrentDir();
  const readmesGlobPattern = await getReadmesGlobForCurrentDir();
  u.debug('storiesGlobPattern:     ', storiesGlobPattern);
  u.debug('readmesGlobPattern:     ', readmesGlobPattern);
  await fs.writeFile(STORIES_PATTERN_PATH, storiesGlobPattern);
  await fs.writeFile(READMES_PATTERN_PATH, readmesGlobPattern);
  return storiesGlobPattern;
}

async function checkStoriesExists (storiesGlobPattern) {
  const storyPaths = await glob(storiesGlobPattern);
  if (storyPaths.length > 0) {
    const formatedPaths = storyPaths
      .map(p => path.relative(process.cwd(), p))
      .map(p => {
        return p.includes('packages/')
          ? p.replace(
              PKG_HIGHLIGHT_RGX,
              `${u.muted('packages/')}$1${u.muted('$2')}`
            )
          : u.muted(p);
      });
    const storyText = formatedPaths.length > 1 ? 'stories' : 'story';
    console.log(` Loading ${storyText}:\n\n  ${formatedPaths.join('\n  ')}\n`);
  } else {
    console.error(
      ` ${chalk.bold('Error: Could not find any stories.')}\n\n ${u.warn(
        `Stories need to match the following path pattern:\n  ${u.underline.white(
          '"' + (await getStoriesGlobForCurrentDir()) + '"'
        )}`
      )}`
    );
    process.exit(1);
  }
}

async function runStorybook () {
  await checkStorybookExists();
  await checkStoriesExists(await writePatternFile());

  const port = await detectPort(u.DEFAULT_PORT);
  const args = STORYBOOK_ARGS.concat(['--port', port]).join(' ');

  const command = `${STORYBOOK_BIN_PATH} ${args}`;

  return u.exec(command, {
    env: Object.assign({}, process.env, { STORYBOOK_CWD: process.cwd() })
  });
}

module.exports = () => {
  runStorybook().catch(u.unhandledError);
};
