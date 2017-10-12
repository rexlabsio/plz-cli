let configCache = null;

function cliConfigFromArgv (argv) {
  const _ = require('lodash');

  const argvConfig = {};
  if (argv.projectType) argvConfig.projectType = argv.projectType;
  if (argv.buildDir) argvConfig.buildDir = argv.buildDir;
  if (argv.runtimeCompilation) {
    argvConfig.runtimeCompilation = argv.runtimeCompilation;
  }
  const argvStorybookConfig = {};
  if (argv.storybookUrl) argvStorybookConfig.url = argv.storybookUrl;
  if (argv.storybookGoFullScreen) {
    argvStorybookConfig.goFullScreen = argv.storybookGoFullScreen;
  }
  if (argv.storybookShowLeftPanel) {
    argvStorybookConfig.showLeftPanel = argv.storybookShowLeftPanel;
  }
  if (argv.storybookShowDownPanel) {
    argvStorybookConfig.showDownPanel = argv.storybookShowDownPanel;
  }
  if (argv.storybookShowSearchBox) {
    argvStorybookConfig.showSearchBox = argv.storybookShowSearchBox;
  }
  if (argv.storybookDownPanelInRight) {
    argvStorybookConfig.downPanelInRight = argv.storybookDownPanelInRight;
  }
  if (argv.storybookSortStoriesByKind) {
    argvStorybookConfig.sortStoriesByKind = argv.storybookSortStoriesByKind;
  }
  if (!_.isEmpty(argvStorybookConfig)) {
    argvConfig.storybook = argvStorybookConfig;
  }

  return argvConfig;
}

function applyFallbackProjectType (config) {
  const u = require('src/utils');
  const defaultProjectType = require('src/configs/project/defaults/base')
    .projectType;
  u.debug(`Project type falling back to "${defaultProjectType}"`);
  config.projectType = defaultProjectType;
}

function throwInvalidProjectType (config, TYPES) {
  const u = require('src/utils');
  const typeMsg = `Given type: "${u.error(config.projectType)}"`;
  const headMsg =
    'Project type needs to be configured to one of the following:';
  const mainListMsg = TYPES.map(x => u.dotpoint(x)).join('\n');
  console.error(
    u.wrapLinesInError(
      'Invalid Project Type',
      `${typeMsg}\n\n${headMsg}\n\n${mainListMsg}\n\n${u.linkToReadme()}`
    )
  );
  process.exit(1);
}

function loadCliConfig () {
  if (configCache) return configCache;
  const path = require('path');
  const cosmiconfig = require('cosmiconfig');
  const merge = require('webpack-merge');
  const u = require('src/utils');
  const {
    CLI_NAME,
    PROJECT_TYPE_MODULE,
    PROJECT_TYPE_REACT_COMPONENT,
    PROJECT_TYPE_REACT_APP
  } = require('src/utils/constants');
  const START_CONFIG_LOOKUP_DIR = path.resolve(process.cwd());
  const STOP_CONFIG_LOOKUP_DIR = path.resolve(process.cwd(), '../../'); // For monorepo's!
  const explorer = cosmiconfig(CLI_NAME, {
    sync: true,
    stopDir: STOP_CONFIG_LOOKUP_DIR,
    rcExtensions: true
  });

  let mergedConfig = {};
  const recursiveConfigLoad = dir => {
    const result = explorer.load(dir);
    if (!result) return mergedConfig;
    const { config, filepath } = result;
    u.debug('Loaded rc config: %o %O', filepath, config);
    mergedConfig = merge(mergedConfig, config);
    return filepath.length > STOP_CONFIG_LOOKUP_DIR
      ? recursiveConfigLoad(path.resolve(filepath, '../'))
      : mergedConfig;
  };

  const TYPES = [
    PROJECT_TYPE_REACT_APP,
    PROJECT_TYPE_REACT_COMPONENT,
    PROJECT_TYPE_MODULE
  ];

  function applyArgvConfig (config) {
    const argvConfig = cliConfigFromArgv(u.globalArgv());
    u.debug('Loaded argv config: %O', argvConfig);
    return merge(config, argvConfig);
  }

  // Load all the config up to our limiting dir (STOP_CONFIG_LOOKUP_DIR)
  let config;
  try {
    config = recursiveConfigLoad(START_CONFIG_LOOKUP_DIR);
  } catch (err) {
    u.unhandledError(err);
  }
  // Override any of our config with the cli args when applicable
  config = applyArgvConfig(config);
  u.debug('All loaded config: %O', config);
  if (!config.projectType) {
    if (config.type) {
      require('src/utils').pushDeprecation(
        'The \'type\' option has been renamed to \'projectType\''
      );
    }
    applyFallbackProjectType(config);
  }

  if (!TYPES.includes(config.projectType)) {
    // Complain and exit if there isn't a defined project type!
    throwInvalidProjectType(config, TYPES);
  } else {
    configCache = config;
    return config;
  }
}

function getCliConfig () {
  if (!configCache) {
    throw new Error('Tried to get CLI Config before it was loaded.');
  }
  return configCache;
}

module.exports = loadCliConfig;
module.exports.get = getCliConfig;
