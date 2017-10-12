const CONSTANTS = {
  CLI_NAME: 'plz',
  DEFAULT_PORT: process.env.PORT || 3000,
  DEFAULT_HOST: 'localhost',
  PROJECT_TYPE_MODULE: 'module',
  PROJECT_TYPE_REACT_COMPONENT: 'react-component',
  PROJECT_TYPE_REACT_APP: 'react-app',
  PACKAGE_OUTPUT_DIRECTORIES: {
    main: 'lib',
    modules: 'module'
  }
};

module.exports = CONSTANTS;
