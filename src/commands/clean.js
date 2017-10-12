/*
|-------------------------------------------------------------------------------
| Clean command
|-------------------------------------------------------------------------------
|
| Removes files and directories generated from previous Builds.
|
*/

const fse = require('fs-extra');
const changeCase = require('change-case');
const u = require('src/utils');
const loadCliConfig = require('src/utils/load-cli-config');
const {
  PROJECT_TYPE_REACT_APP,
  PROJECT_TYPE_REACT_COMPONENT,
  PROJECT_TYPE_MODULE,
  PACKAGE_OUTPUT_DIRECTORIES
} = require('src/utils/constants');

async function removeModuleBundles ({ buildDir, logRemovalSuccess } = {}) {
  let didClean = false;
  for (let pkgType in PACKAGE_OUTPUT_DIRECTORIES) {
    const dir = u.cwdRel(u.to(buildDir, PACKAGE_OUTPUT_DIRECTORIES[pkgType]));
    const exists = await fse.exists(dir);
    if (exists) {
      await fse.remove(dir);
      didClean = true;
      logRemovalSuccess(dir);
    }
  }
  return didClean;
}

async function removeAppBundle ({ buildDir, logRemovalSuccess } = {}) {
  let didClean = false;
  const dir = u.cwdRel(buildDir);
  const exists = fse.exists(dir);
  if (exists) {
    await fse.remove(dir);
    logRemovalSuccess(dir);
    didClean = true;
  }
  return didClean;
}

async function clean ({ projectType, buildDir, logRemovalSuccess } = {}) {
  let didClean = false;
  switch (projectType) {
    case PROJECT_TYPE_REACT_COMPONENT:
    case PROJECT_TYPE_MODULE:
      didClean = await removeModuleBundles({
        buildDir,
        logRemovalSuccess
      }).catch(u.unhandledError);
      break;
    case PROJECT_TYPE_REACT_APP:
      didClean = await removeAppBundle({
        buildDir,
        logRemovalSuccess
      }).catch(u.unhandledError);
      break;
    default:
      didClean = false;
  }
  return didClean;
}

module.exports = () => {
  const { projectType } = loadCliConfig();
  let cliConfig = null;
  switch (projectType) {
    case PROJECT_TYPE_MODULE:
    case PROJECT_TYPE_REACT_COMPONENT:
      cliConfig = require('src/configs/project/module')();
      break;
    case PROJECT_TYPE_REACT_APP:
      cliConfig = require('src/configs/project/app')({ isBaseOnly: true });
      break;
    default:
      throw new Error(
        `Could not match the project type "${projectType}" to while loading storybook's webpack config.`
      );
  }
  const { buildDir } = cliConfig;
  const name = u.getPackageJson().name || changeCase.titleCase(projectType);
  const startMessage = `Cleaning ${u.bold.magenta(name)}`;
  const logRemovalSuccess = path =>
    spinner
      .info(u.muted(`Removed ${u.bold.magenta(`./${u.cwdRel(path)}`)}`))
      .start(startMessage);

  const spinner = u.spinner().start(startMessage);
  clean({ projectType, buildDir, logRemovalSuccess })
    .then(
      didClean =>
        didClean
          ? spinner.succeed(`Cleaned ${u.bold.magenta(name)}`)
          : spinner.warn('Nothing to clean!')
    )
    .catch(u.unhandledError);
};
