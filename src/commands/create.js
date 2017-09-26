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
const u = require('../libs/util');

const TEMPLATE_PATH = u.to(__dirname, '../../templates/');
const REACT_VERSION = u.pkg.peerDependencies.react;
const PLZ_CLI_VERSION = '1.x';
const PLZ_CLI_NAME = u.pkg.name;
const POST_CREATE_MESSAGES = {
  'react-app': ({ relDir }) =>
    `
  ${u.underline('Geting started:')} \`cd ${relDir} && yarn && yarn start\`
  `.trim()
};

const cleanBuffer = x => x.toString().trim();
const fetchPkgVersion = (registry, pkgName) =>
  u.execGetOutput(`npm info ${pkgName} dist-tags.latest`, {
    stdio: 'ignore',
    env: Object.assign({}, process.env, {
      npm_config_registry: registry
    })
  });
async function scaffold (name, targetDir, type) {
  const templateName = changeCase.titleCase(type);
  const spinner = u
    .spinner(
      `Creating "${u.bold.magenta(name)}" ${u.muted(`(${templateName})`)}`
    )
    .start();
  // HACK: Avoid Yarn from overriding registry, which may screw up private pkg access.
  let registry = 'https://registry.npmjs.org/';
  const fetchVersion = async (name, backupVersion) => {
    const version = await fetchPkgVersion(registry, name);
    return version ? `^${cleanBuffer(version)}` : backupVersion;
  };

  // First, we setup all the env vars for the template
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
    u.execGetOutput('git config user.email', optIgnore).then(cleanBuffer),
    u.execGetOutput('git config user.name', optIgnore).then(cleanBuffer),
    u
      .execGetOutput('git config remote.origin.url', optIgnore)
      .catch(() => 'FILL_IN_LATER')
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
  const templatePath = path.resolve(TEMPLATE_PATH, type);
  const err = await u.getWriteError(templatePath);
  if (err) {
    spinner.stop();
    spinner.clear();
    throw new Error(
      `Cannot access template \`${templatePath}\`:\n${err.message}`
    );
  } else {
    const relDir = path.relative(process.cwd(), targetDir);
    await copyTemplateDir(templatePath, targetDir, vars);
    spinner.succeed(
      `Created "${u.bold.magenta(relDir)}" ${u.muted(`(${templateName})`)}`
    );

    if (type in POST_CREATE_MESSAGES) {
      console.log(
        '\n  ' +
          POST_CREATE_MESSAGES[type]({ relDir })
            .split('\n')
            .join('\n  ')
      );
    }
  }
}

async function runScaffoldCommand ({ name, rootPath = '', type }) {
  if (!name) {
    console.error(new Error('Missing a valid package name.'));
    process.exit(1);
  }
  const packageName = changeCase.paramCase(name);
  u.debug('name:     ', packageName);
  u.debug('rootPath: ', rootPath);
  u.debug('type:     ', type);

  const rootDir = u.cwdTo(rootPath);
  const packageDir = u.cwdTo(rootPath, packageName);

  const err = await u.getWriteError(rootDir);
  if (err) {
    throw new Error(
      `Cannot write to root directory \`${rootDir}\`:\n${err.message}`
    );
  } else {
    try {
      await scaffold(packageName, packageDir, type);
    } catch (err) {
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
