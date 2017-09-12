import _ from 'lodash';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import { setAuthToken, setAccountId } from 'utils/api-client';

/**
 * Updates the singleton API client with session constants.
 */
export const apiClientMiddleware = store => next => action => {
  const state = store.getState();
  if (state.session.user) {
    // TODO: Setup session model to receive API account/token details.
    // setAccountId(_.get(state, 'session.accountId'));
    // setAuthToken(_.get(state, 'session.apiToken'));
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
 * @param {Boolean} isLogging - Whether to log to redux actions to console.
 * @returns {Function}
 */
function createMiddlewareStack (middlewares, isLogging) {
  let middlewareStack = [thunkMiddleware, ...middlewares];

  if (isLogging) {
    const logger = createLogger();
    middlewareStack.push(logger);
    console.log('Applied the Redux Logger');
  }
  return applyMiddleware.apply(null, middlewareStack);
}

/**
 * Creates a redux store with the following properties:
 * 1. Support for Redux DevTools and most monitor implementations (DEV only).
 * 2. Middleware
 *     - redux-thunk
 *     - redux-logger (DEV only)
 *
 * @param {Redux.Reducer} rootReducer - The top level reducer, to used in
 *        the redux store.
 * @param {Object} [middlewares] - Other middleware to apply to the store.
 * @param {Boolean} [isLogging=false] - Whether to log to redux actions to console.
 * @returns {Redux.Store}
 */
export function configureStore (
  rootReducer,
  middlewares = [],
  enhancers = [],
  isLogging = false
) {
  const initialState = {};
  let allMiddleware = [];
  if (middlewares) allMiddleware = allMiddleware.concat(middlewares);

  return createStore(
    rootReducer,
    initialState,
    createEnhancer(createMiddlewareStack(allMiddleware, isLogging), ...enhancers)
  );
}
