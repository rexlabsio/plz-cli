/*
|-------------------------------------------------------------------------------
| Global Util Setup
|-------------------------------------------------------------------------------
*/

import config from 'src/config';
import BluebirdPromise from 'bluebird';

if (!global) {
  // eslint-disable-next-line
  global = global || window;
}

if (global) {
  // hack to work in node
  global.__DEV__ = typeof global.__DEV__ !== 'undefined'
    ? global.__DEV__
    : process.env.NODE_ENV !== 'production';
}

if (__DEV__) {
  console.log(
    `
Development Environment:

  __DEV__ = true
${Object.keys(config).map(key => `  ${key} = ${config[key]}`).join('\n')}
`.trim()
  );
}

// Replaces Promise with the Bluebird implementation, and adds a global rejection
// handler.
global.Promise = BluebirdPromise;
Promise.onPossiblyUnhandledRejection(function (rejectionError) {
  const error = new Error(
    'Promises rejections should always be handled with catch().'
  );
  error.message = `${error.message}\n\n${rejectionError.message}`;
  error.name = `Unhandled Promise Rejection (${rejectionError.name})`;
  error.stack = rejectionError.stack;
  throw error;
});

// Disable warnings for missed returns in Bluebird.
// See https://github.com/petkaantonov/bluebird/issues/903
Promise.config({
  // Disables all warnings.
  warnings: false
});
