const u = require('src/utils');

/**
 * Display current build status for a Webpack watch build.
 * Based on create-react-app@0.2's start script.
 */
class StatusPlugin {
  constructor (
    {
      message = '',
      middleware = false,
      test = false,
      initialTime,
      initialCompile = () => {}
    } = {}
  ) {
    // Provides details of the URL the dev server is available at
    this.message = message;
    // Flag: don't clear the console as we're in someone else's server
    this.middleware = middleware;
    // Flag: ONLY log errors and warnings
    this.test = test;
    // Changes the initial "Compiled" time
    this.initialTime = initialTime;
    this.initialCompile = initialCompile;

    // We only want to display the "Starting..." message once
    this.initial = true;

    this.spinner = u.spinner();

    this.watchRun = this.watchRun.bind(this);
    this.done = this.done.bind(this);
  }

  apply (compiler) {
    compiler.plugin('watch-run', this.watchRun);
    compiler.plugin('done', this.done);
  }

  clearConsole () {
    if (!this.test) {
      u.clearConsole();
    }
  }

  log (message) {
    if (!this.test) {
      console.log(message);
    }
  }

  watchRun (watching, cb) {
    if (!this.middleware) {
      this.clearConsole();
    }
    if (this.initial) {
      this.spinner.start(u.bold.magenta('Bootin\' up dev server!'));
    } else {
      this.spinner.start(u.bold.magenta('Recompiling ;('));
    }
    cb();
  }

  done (stats) {
    if (!this.middleware) {
      this.spinner.stop();
      this.clearConsole();
    }

    let hasErrors = stats.hasErrors();
    let hasWarnings = stats.hasWarnings();

    if (!hasErrors && !hasWarnings) {
      let time =
        stats.endTime -
        (this.initialTime ? parseInt(this.initialTime) : stats.startTime);
      this.spinner.succeed(
        u.bold.magenta(`${this.initial ? 'Done' : 'Back'} in ${time} ms.`)
      );
      if (this.initial) {
        this.initialCompile();
      }
      this.initial = false;
      this.initialTime = false;
    } else {
      u.logErrorsAndWarnings(stats);
      if (hasErrors) return;
    }

    if (!this.middleware) {
      this.log('');
      this.log(this.message);
    }
  }
}

module.exports = StatusPlugin;
