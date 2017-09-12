/*
|-------------------------------------------------------------------------------
| Singleton App Store (Redux)
|-------------------------------------------------------------------------------
|
| It's inclusion in other modules in the App should ideally come from dependency
| injection techniques to keep those files testable.
|
*/

import { persistStore, autoRehydrate } from 'redux-persist';
import { configureStore, apiClientMiddleware } from 'utils/redux';
// TODO: Router & Models
import config from 'src/config';

const store = configureStore(
  state => state, // TODO: Replace with model reducers
  [apiClientMiddleware],
  [autoRehydrate()],
  config.LOG_REDUX
);

// TODO: Add session model persistence logic.

export default store;
