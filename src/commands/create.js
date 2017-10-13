/*
|-------------------------------------------------------------------------------
| Create command
|-------------------------------------------------------------------------------
|
| Generates new directories with package structure default.
|
| Uses scaffold templates from: '/templates/'.
|
*/

const pify = require('pify');
const copyTemplateDir = pify(require('copy-template-dir'));
const path = require('path');
const changeCase = require('change-case');
const isUp = require('is-up');
const u = require('../utils');
const { PROJECT_TYPE_REACT_APP } = require('../utils/constants');

// HACK: Avoid Yarn from overriding registry, which may screw up private pkg access.
const REGISTRY_DOMAIN = 'registry.npmjs.org';
const REGISTRY_URL = `https://${REGISTRY_DOMAIN}/`;
const FALLBACK_VERSION = 'latest';
const TEMPLATE_PATH = u.to(__dirname, '../../templates/');
const REACT_VERSION = u.pkg.peerDependencies.react;
const PLZ_CLI_VERSION = u.pkg.version.replace(
  /(\d)\..*/,
  ([major]) => `${major}.x`
);
const PLZ_CLI_NAME = u.pkg.name;
const POST_CREATE_MESSAGES = {
  [PROJECT_TYPE_REACT_APP]: ({ relDir, name }) =>
    `${u.underline('Getting started:')}\nHey ${name ||
      'developer'}!\nRun \`${u.warn(
      `cd ${relDir} && yarn && yarn start`
    )}\` to begin development.`,
  OFFLINE: `${u.underline('Note:')}\nRunning \`${u.warn(
    'yarn upgrade-interactive'
  )}\` in the project will pin fallback versions.`
};

const cleanBuffer = x => (!x ? '' : x.toString().trim());
const fetchPkgVersion = async (registry, pkgName) =>
  u.execGetOutput(`npm info ${pkgName} dist-tags.latest`, {
    stdio: 'ignore',
    env: Object.assign({}, process.env, {
      npm_config_registry: registry
    })
  });
async function scaffold (name, templateName, targetDir, projectType, spinner) {
  spinner.start();
  const start = +new Date();
  const isRegistryOnline = await isUp(REGISTRY_DOMAIN).catch(() => false);
  if (!isRegistryOnline) {
    const diff = +new Date() - start;
    spinner
      .warn(
        u.muted.italic(
          `Registry offline.${diff > 50
            ? ` (timed out in ${(diff / 1000).toFixed(2)}s)`
            : ''}`
        )
      )
      .start();
  }
  const fetchVersion = async (name, backupVersion) => {
    let version;
    if (isRegistryOnline) {
      version = await fetchPkgVersion(REGISTRY_URL, name);
    } else {
      spinner
        .info(
          u.muted(`Fallback to "${FALLBACK_VERSION}" for ${u.underline(name)}`)
        )
        .start();
    }
    return version ? `^${cleanBuffer(version)}` : backupVersion;
  };
  const warnSpin = msg => () => spinner.warn(msg).start();
  const infoSpin = msg => () => spinner.info(msg).start();

  const optIgnore = { stdio: 'ignore' };
  const [
    email,
    username,
    remoteUrl,
    pkgVerStyling,
    pkgVerApiClient,
    pkgVerBox,
    pkgVerText,
    pkgVerForms,
    pkgVerModelGenerator
  ] = await Promise.all([
    u
      .execGetOutput('git config user.email', optIgnore)
      .catch(
        warnSpin(
          `Your git ${u.italic('user.email')} isn't configured? ${u.emoji(
            '😭',
            ''
          )}`
        )
      )
      .then(cleanBuffer),
    u
      .execGetOutput('git config user.name', optIgnore)
      .catch(
        warnSpin(
          `Your git ${u.italic('user.name')} isn't configured? ${u.emoji(
            '😭',
            ''
          )}`
        )
      )
      .then(cleanBuffer),
    u
      .execGetOutput('git config remote.origin.url', optIgnore)
      .catch(() => {
        infoSpin(
          'The "repository" field in package.json requires updating once Git is initialized.'
        )();
        return '';
      })
      .then(cleanBuffer),
    fetchVersion('@rexlabs/styling', '1.x'),
    fetchVersion('@rexlabs/api-client', '2.x'),
    fetchVersion('@rexlabs/box', '1.x'),
    fetchVersion('@rexlabs/text', '1.x'),
    fetchVersion('@rexlabs/form', '1.x'),
    fetchVersion('@rexlabs/model-generator', '1.x')
  ]);

  const vars = {
    NAME: name,
    SLUGGED_NAME: changeCase.paramCase(name),
    TITLE_NAME: changeCase.titleCase(name),
    CAMEL_CASE: changeCase.camelCase(name),
    PASCAL_NAME: changeCase.pascalCase(name),
    PACKAGEJSON: 'package', // Note: We avoid npm 'pack' rules during publish
    REACT_VERSION: REACT_VERSION,
    'PKG_VER.STYLING': pkgVerStyling,
    'PKG_VER.API_CLIENT': pkgVerApiClient,
    'PKG_VER.BOX': pkgVerBox,
    'PKG_VER.TEXT': pkgVerText,
    'PKG_VER.FORMS': pkgVerForms,
    'PKG_VER.MODEL_GENERATOR': pkgVerModelGenerator,
    CLI_NAME: PLZ_CLI_NAME,
    CLI_VERSION: PLZ_CLI_VERSION,
    HAS_AUTHOR_EMAIL: email ? ' ' : '',
    AUTHOR_EMAIL: email ? `<${email}>` : '',
    AUTHOR_NAME: username,
    GIT_REMOTE_URL: remoteUrl,
    YEAR: new Date().getFullYear()
  };

  // Secondly, we run the template through a mustache engine to the target dir
  const templatePath = path.resolve(TEMPLATE_PATH, projectType);
  const err = await u.getWriteError(templatePath);
  if (err) {
    spinner.stop();
    spinner.clear();
    throw new Error(
      `Cannot access template \`${templatePath}\`:\n${err.message}`
    );
  } else {
    const relDir = u.cwdRel(targetDir);
    await copyTemplateDir(templatePath, targetDir, vars);
    spinner.succeed(
      `Created "${u.bold.magenta(relDir)}" ${u.muted(`(${templateName})`)}`
    );

    const logPostMessage = msg => {
      const [head, ...lines] = msg.split('\n');
      console.log(`\n  ${head}\n\n${lines.map(l => `    ${l}`).join('\n')}`);
    };
    if (projectType in POST_CREATE_MESSAGES) {
      logPostMessage(
        POST_CREATE_MESSAGES[projectType]({ relDir, name: username })
      );
    }
    if (!isRegistryOnline) {
      logPostMessage(POST_CREATE_MESSAGES.OFFLINE);
    }
  }
}

async function runScaffoldCommand ({ name, rootDir = '', projectType }) {
  if (!name) {
    console.error(new Error('Missing a valid package name.'));
    process.exit(1);
  }
  const packageName = changeCase.paramCase(name);
  const templateName = changeCase.titleCase(projectType);
  u.debug('"name":     %o', packageName);
  u.debug('"templateName":     %o', templateName);
  u.debug('"rootDir":  %o', rootDir);
  u.debug('"projectType":     %o', projectType);

  const rootDirRel = u.cwdTo(rootDir);
  const packageDir = u.cwdTo(rootDirRel, packageName);
  const spinner = u.spinner(
    `Creating "${u.bold.magenta(name)}" ${u.muted(`(${templateName})`)}`
  );

  const err = await u.getWriteError(rootDirRel);
  if (err) {
    throw new Error(
      `Cannot write to root directory \`${rootDirRel}\`:\n${err.message}`
    );
  } else {
    try {
      await scaffold(
        packageName,
        templateName,
        packageDir,
        projectType,
        spinner
      );
    } catch (err) {
      spinner.stop();
      spinner.clear();
      console.error(`${u.error(`Error creating ${packageName} package.`)}`);
      console.log();
      console.error(err);
      process.exit(1);
    }
  }
}

module.exports = argv => {
  runScaffoldCommand(argv).catch(u.unhandledError);
};
