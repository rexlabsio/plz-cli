/*
|-------------------------------------------------------------------------------
| Redux Utils
|-------------------------------------------------------------------------------
|
| - Construct the store with DX Tools setup
|   - Add thunk middleware
|   - Add enhancements for redux devtools
| - Middleware for adding deferred auth details to the API Client
|
*/

import _ from 'lodash';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { setAuthToken, setAccountId } from 'utils/api-client';

/**
 * Updates the singleton API client with session constants.
 */
export const apiClientMiddleware = store => next => action => {
  const state = store.getState();
  if (_.get(state, 'session.authToken')) {
    // NOTE: These fields are also kept in the store's session model.
    setAccountId(_.get(state, 'session.accountId'));
    setAuthToken(_.get(state, 'session.apiToken'));
  }
  return next(action);
};

/**
 * Creates an enhanced store middleware, out of a stack of middleware.
 * Injects a debugger middleware when in DEV mode.
 * @param {Function} enhancers - A middleware stack.
 * @returns {Function}
 */
function createEnhancer (...enhancers) {
  const composer = __DEV__ ? composeWithDevTools : compose;
  return composer(...enhancers);
}

/**
 * Creates a stack of middleware.
 * Injects a logger when in DEV mode.
 * @param {Object} middlewares - a collection of middleware
 * @returns {Function}
 */
function createMiddlewareStack (middlewares) {
  let middlewareStack = [thunkMiddleware, ...middlewares];
  return applyMiddleware.apply(null, middlewareStack);
}

/**
 * Creates a redux store with the following properties:
 * 1. Support for Redux DevTools and most monitor implementations (DEV only).
 * 2. Middleware
 *     - redux-thunk
 *
 * @param {Redux.Reducer} rootReducer - The top level reducer, to used in
 *        the redux store.
 * @param {Object} [middlewares] - Other middleware to apply to the store.
 * @param {Boolean} [isLogging=false] - Whether to log to redux actions to console.
 * @returns {Redux.Store}
 */
export function configureStore (rootReducer, middlewares = [], enhancers = []) {
  const initialState = {};
  let allMiddleware = [];
  if (middlewares) allMiddleware = allMiddleware.concat(middlewares);

  return createStore(
    rootReducer,
    initialState,
    createEnhancer(createMiddlewareStack(allMiddleware), ...enhancers)
  );
}
