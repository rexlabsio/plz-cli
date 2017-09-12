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
const fs = pify(require('fs'));
const copyTemplateDir = pify(require('copy-template-dir'));
const path = require('path');
const chalk = require('chalk');
const changeCase = require('change-case');
const u = require('../libs/util');

const TEMPLATE_PATH = u.to(__dirname, '../../templates/');
const REACT_VERSION = '>=15.5.0 <16.0.0';
const CORE_JS_VERSION = '1.x';
const PLZ_CLI_VERSION = '1.x';
const PLZ_CLI_NAME = u.pkg.name;

const cleanBuffer = x => x.toString().trim();
const fetchPkgVersion = (registry, pkgName) =>
  u.execGetOutput(`npm info ${pkgName} dist-tags.latest`, {
    stdio: 'ignore',
    env: Object.assign({}, process.env, {
      npm_config_registry: registry
    })
  });
async function scaffold (name, targetDir, type) {
  const spinner = u.spinner('Fetching scaffold metadata').start();
  // HACK: Avoid Yarn from overriding registry, which may screw up private pkg access.
  let registry = 'https://registry.npmjs.org/';
  const fetchVersion = fetchPkgVersion.bind(null, registry);

  // First, we setup all the env vars for the template
  let email = await u.execGetOutput('git config user.email', {
    stdio: 'ignore'
  });
  let remoteUrl = await u.execGetOutput('git config remote.origin.url', {
    stdio: 'ignore'
  });
  let username = await u.execGetOutput('git config user.name', {
    stdio: 'ignore'
  });
  email = cleanBuffer(email);
  remoteUrl = cleanBuffer(remoteUrl);
  username = cleanBuffer(username);
  let stylingJsVersion, apiClientJsVersion;
  if (type === 'react-app' || type === 'react-component') {
    let stylingJsVersion = await fetchVersion('@rexlabs/styling');
    stylingJsVersion = stylingJsVersion
      ? `^${cleanBuffer(stylingJsVersion)}`
      : '1.x';
  }
  if (type === 'react-app') {
    let apiClientJsVersion = await fetchVersion('@rexlabs/api-client');
    apiClientJsVersion = apiClientJsVersion
      ? `^${cleanBuffer(apiClientJsVersion)}`
      : '2.x';
  }
  spinner.succeed('Fetched scaffold metadata');
  const vars = {
    NAME: name,
    SLUGGED_NAME: changeCase.paramCase(name),
    TITLE_NAME: changeCase.titleCase(name),
    CAMEL_CASE: changeCase.camelCase(name),
    PASCAL_NAME: changeCase.pascalCase(name),
    PACKAGEJSON: 'package', // Note: We avoid npm 'pack' rules during publish
    REACT_VERSION: REACT_VERSION,
    CORE_JS_VERSION: CORE_JS_VERSION,
    STYLING_JS_VERSION: stylingJsVersion,
    API_CLIENT_JS_VERSION: stylingJsVersion,
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
    throw new Error(
      `Cannot access template \`${templatePath}\`:\n${err.message}`
    );
  } else {
    const templateName = changeCase.titleCase(type);
    const relDir = path.relative(process.cwd(), targetDir);
    const spinner = u
      .spinner(`Generating '${u.italic(templateName)}': ${u.underline(relDir)}`)
      .start();
    await copyTemplateDir(templatePath, targetDir, vars);
    spinner.succeed(
      `Generated '${u.italic(templateName)}': ${u.underline(relDir)}`
    );
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
      console.error(err);
      process.exit(1);
    }
  }
}

module.exports = argv => {
  runScaffoldCommand(argv).catch(u.unhandledError);
};
