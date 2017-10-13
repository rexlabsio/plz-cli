/*
|-------------------------------------------------------------------------------
| Build command
|-------------------------------------------------------------------------------
|
| Compiles the source of projects.
|
*/

const pify = require('pify');
const path = require('path');
const fs = pify(require('fs'));
const fse = require('fs-extra');
const changeCase = require('change-case');
const merge = require('webpack-merge');
const u = require('../utils');
const loadCliConfig = require('../utils/load-cli-config');
const {
  PROJECT_TYPE_REACT_APP,
  PROJECT_TYPE_REACT_COMPONENT,
  PROJECT_TYPE_MODULE,
  PACKAGE_OUTPUT_DIRECTORIES
} = require('../utils/constants');

const BABEL_EXEC_ARGS = [
  {
    env: {
      PATH: process.env.PATH,
      NODE_ENV: 'production',
      BABEL_DISABLE_CACHE: '1'
    }
  }
];

function resolveBabelPipeline (pipeline) {
  return pipeline
    .catch(err => {
      console.error(err);
    })
    .then(() => fse.remove('.babelrc'));
}

function dumpBabelRc (config) {
  return fs.writeFile('.babelrc', JSON.stringify(config, null, 2));
}

function babelBuild (outDir) {
  return () =>
    u.exec(
      [
        require.resolve('.bin/babel'),
        path.resolve('src'),
        '--out-dir',
        outDir,
        '--quiet',
        '--ignore __*/'
      ].join(' '),
      ...BABEL_EXEC_ARGS
    );
}

async function buildModule ({ name } = {}) {
  const merge = require('webpack-merge');
  const getBabelConfig = ({ modulesType } = {}) =>
    require('../configs/project/module')({ modulesType }).babel;

  const buildMain = () => {
    const babelBaseConfig = getBabelConfig({ modulesType: 'commonjs' });
    const babelExtrasConfig = {
      plugins: ['add-module-exports']
    };
    const babelConfig = merge(babelBaseConfig, babelExtrasConfig);
    return resolveBabelPipeline(
      dumpBabelRc(u.absolutifyBabel(babelConfig)).then(
        babelBuild(PACKAGE_OUTPUT_DIRECTORIES.main)
      )
    ).then(() => PACKAGE_OUTPUT_DIRECTORIES.main);
  };

  const buildModule = () => {
    const babelConfig = getBabelConfig({ modulesType: false });
    return resolveBabelPipeline(
      dumpBabelRc(u.absolutifyBabel(babelConfig)).then(
        babelBuild(PACKAGE_OUTPUT_DIRECTORIES.modules)
      )
    ).then(() => PACKAGE_OUTPUT_DIRECTORIES.modules);
  };

  const spinner = u.spinner(`Building ${u.bold.magenta(name)}`).start();
  const logBundleSuccess = dir =>
    spinner
      .info(u.muted(`Bundled ${u.bold.magenta(`./${u.cwdRel(dir)}`)}`))
      .start();
  await buildMain().then(logBundleSuccess);
  await buildModule().then(logBundleSuccess);
  spinner.succeed(`Built ${u.bold.magenta(name)}`);
}

async function getAppCompiler (output) {
  const webpack = require('webpack');
  const getWebpackConfig = ({ modulesType } = {}) =>
    require('../configs/project/app')({
      isBuild: true,
      output: output
    }).webpack;
  return webpack(
    merge(getWebpackConfig(), {
      stats: {
        warnings: false
      }
    })
  );
}

async function buildApp ({ name, output } = {}) {
  const compiler = await getAppCompiler(output).catch(err => {
    if (err.validationErrors) {
      u.wrapLinesInError('Config Validation Error', err.message);
    } else {
      u.unhandledError(err);
    }
  });

  if (!compiler) return;
  const spinner = u.spinner(`Building ${u.bold.magenta(name)}...`).start();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        spinner.fail();
        console.log();
        u.logErrorsAndWarnings(stats);
        reject(err);
      } else {
        u.logBuildResults(
          stats,
          spinner,
          `Built ${u.bold.magenta(name)}`,
          `Failed to build ${u.bold.magenta(name)}`
        );
        resolve();
      }
    });
  });
}

async function start (argv) {
  const { projectType } = loadCliConfig();
  const name = u.getPackageJson().name || changeCase.titleCase(projectType);

  // Default to production mode, except when it's explicitly in development.
  process.env.NODE_ENV =
    process.env.NODE_ENV === 'development' ? 'development' : 'production';

  switch (projectType) {
    case PROJECT_TYPE_MODULE:
    case PROJECT_TYPE_REACT_COMPONENT:
      return buildModule({ name });
    case PROJECT_TYPE_REACT_APP:
      return buildApp({ name, output: argv.output });
    default:
      throw new Error(`No build setup available for ${projectType}`);
  }
}

module.exports = argv => {
  start(argv).catch(u.unhandledError);
};
