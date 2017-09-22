/*
|-------------------------------------------------------------------------------
| Singleton App Store (Redux)
|-------------------------------------------------------------------------------
|
| It's inclusion in other modules in the App should ideally come from dependency
| injection techniques to keep those files testable.
|
*/

import _ from 'lodash';
import { combineReducers } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import { batchedSubscribe } from 'redux-batched-subscribe';
import { configureStore, apiClientMiddleware } from 'utils/redux';
import {
  connectionReducer as connection,
  connectionMiddleware
} from 'utils/connection-status';
import { configureReduxForms } from 'utils/redux-forms';

/*
| Core Models
|------------------------
*/
import app from 'data/models/local/app-state';

/*
| Setup for Stores
|------------------------
*/
// TODO: Add router & models
const reducers = combineReducers({ app, connection });

const store = configureStore(
  reducers,
  [apiClientMiddleware, connectionMiddleware],
  [
    batchedSubscribe(_.debounce(notify => notify(), 10, { leading: true })),
    autoRehydrate()
  ]
);

// NOTE: `session` store chunk doesn't yet exist
// NOTE: `initSession` function should likely dispatch session setters
const persistedStore = persistStore(
  store,
  {
    whitelist: ['session'],
    keyPrefix: 'com.rex.{{SLUGGED_NAME}}'
  },
  () => {
    const initSession = () => Promise.resolve();
    initSession()
      .then(() => store.dispatch(app.actionCreators.setReady()))
      .catch(e => {
        console.error('Store rehydration failed.');
        console.error(e);
        store.dispatch(app.actionCreators.setReady());
      });
  }
);

if (__DEV__) {
  window.purgePersistedStore = persistedStore.purge;
}

const { formStore, FormProvider } = configureReduxForms();
export { store, formStore, FormProvider };
