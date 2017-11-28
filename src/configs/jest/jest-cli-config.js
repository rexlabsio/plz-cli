const loadCliConfig = require('../../utils/load-cli-config');
const {
  PROJECT_TYPE_MODULE,
  PROJECT_TYPE_REACT_COMPONENT,
  PROJECT_TYPE_REACT_APP
} = require('../../utils/constants');

module.exports = () => {
  const { projectType } = loadCliConfig();

  let cliConfig = null;
  switch (projectType) {
    case PROJECT_TYPE_MODULE:
    case PROJECT_TYPE_REACT_COMPONENT:
      cliConfig = require('../../configs/project/module')();
      break;
    case PROJECT_TYPE_REACT_APP:
      cliConfig = require('../../configs/project/app')({ isBaseOnly: true });
      break;
    default:
      throw new Error(
        `Could not match the project type "${projectType}" to while loading storybook's webpack config.`
      );
  }
  return cliConfig;
};
