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
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
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
import session from 'data/models/custom/session';

/*
 | Routing / Location Management (whereabouts)
 |------------------------
 */
// TODO: add whereabouts once PR has been merged!

/*
 | Entity Models (Model Generator)
 |------------------------
 */
// NOTE: import entity models here

/*
| Setup for Stores
|------------------------
*/
// const entities = combineModels('entities', {});
const reducers = combineReducers({ session, connection });
const persistConfig = { key: 'root', storage: storage };
const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore(
  persistedReducer,
  [ apiClientMiddleware, connectionMiddleware ],
  [ batchedSubscribe(_.debounce((notify) => notify(), 10, { leading: true })) ]
);

const persistedStore = persistStore(store, null, () => {
  // Add more init logic here if necessary
  store.dispatch(session.actionCreators.init()).catch(console.warn);
});

if (__DEV__) {
  window.purgePersistedStore = persistedStore.purge;
}

const { formStore, FormProvider } = configureReduxForms();
export { store, formStore, FormProvider };
