/*
|-------------------------------------------------------------------------------
| Serve command
|-------------------------------------------------------------------------------
|
| Creates a dev server, for a rapid feedback loop during development of packages
| concerned with UI.
|
*/

// Setting node env specifically to 'development' here, to ensure we can adjust
//  the webpack config according to the environment (e.g. source maps)
process.env.NODE_ENV = 'development';

const pify = require('pify');
const detect = pify(require('detect-port'));
const address = require('address');
const inquirer = require('inquirer');
const historyAPIFallback = require('connect-history-api-fallback');
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const express = require('express');
const webpack = require('webpack');
const u = require('src/utils');
const loadCliConfig = require('src/utils/load-cli-config');
const { DEFAULT_PORT, DEFAULT_HOST } = require('src/utils/constants');

function devServer (webpackConfig, { fallback, host, lanHost, port }) {
  let app = express();
  let compiler = webpack(webpackConfig);

  if (fallback !== false) {
    app.use(historyAPIFallback());
  }

  app.use(
    require('webpack-dev-middleware')(compiler, {
      noInfo: true,
      publicPath: webpackConfig.output.publicPath,
      quiet: true,
      watchOptions: {
        ignored: /node_modules/
      }
    })
  );

  app.use(
    require('webpack-hot-middleware')(compiler, {
      log: false
    })
  );

  function onServerStart (err) {
    if (err) throw new Error(err);
  }

  app.listen(port, host, onServerStart);
  app.listen(port, lanHost, onServerStart);
}

function portPrompt (suggestedPort) {
  return [
    {
      type: 'confirm',
      name: 'shouldRun',
      message: `Would you like to run the app on another port (${suggestedPort}) instead?`,
      default: true
    }
  ];
}

async function getServerOptions (argv) {
  const host = argv.host || DEFAULT_HOST;
  const lanHost = address.ip();
  let port = argv.port || DEFAULT_PORT;
  const suggestedPort = await detect(port);

  if (suggestedPort !== port) {
    u.clearConsole();
    console.log(u.warn(`Something is already running on port ${port}.`));
    console.log();

    const { shouldRun } = await inquirer.prompt(portPrompt(suggestedPort));

    if (shouldRun) {
      port = suggestedPort;
    } else {
      return;
    }
  }

  return { host, lanHost, port: port };
}

module.exports = argv => {
  Promise.all([loadCliConfig(), getServerOptions(argv)])
    .then(([cliConfig, serverConfig]) => {
      const {
        lanUrlForTerminal,
        localUrlForTerminal,
        localUrlForBrowser
      } = prepareUrls(
        'http',
        serverConfig.host === DEFAULT_HOST ? '0.0.0.0' : serverConfig.host,
        serverConfig.port
      );
      const webpackConfig = require('src/configs/project/app')({
        reload: argv.reload,
        status: {
          message: `  The app is running at:

    ${u.muted('Local')} ${localUrlForTerminal}
    ${u.muted('  Lan')} ${lanUrlForTerminal}
${u.emoji('🏃', '')}`,
          initialTime: process.env.CLI_START_TIME,
          initialCompile: () => {
            openBrowser(localUrlForBrowser);
          }
        }
      }).webpack;

      devServer(webpackConfig, {
        fallback: argv.fallback,
        ...serverConfig
      });
    })
    .catch(u.unhandledError);
};
