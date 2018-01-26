import fp from 'lodash/fp';
import api from 'axios';
import config from 'config';

const initialState = {
  isOnline: false
};

export const STATUS_CHANGED = 'Connection.STATUS_CHANGED';
export const STATUS_PENDING = 'Connection.STATUS_PENDING';

export const checkApiOnline = () =>
  api
    .options(config.API_URL)
    .then(() => true)
    .catch(() => false);

export const connectionStatusChanged = isOnline => ({
  type: STATUS_CHANGED,
  payload: isOnline
});

export const connectionStatusPending = pending => ({
  type: STATUS_PENDING,
  payload: pending
});

const handlers = {
  [STATUS_CHANGED]: (state, payload) => ({ ...state, isOnline: payload }),
  [STATUS_PENDING]: (state, payload) => ({ ...state, pending: payload })
};

export const connectionReducer = (state = initialState, { type, payload }) =>
  !handlers.hasOwnProperty(type) ? state : handlers[type](state, payload);

export const connectionMiddleware = ({ dispatch }) => {
  if (navigator) {
    const changeStatus = fp.compose(dispatch, connectionStatusChanged);

    if (navigator.onLine) {
      changeStatus(true);
    } else {
      // When the browser if online, we mah still have access to a local server.
      checkApiOnline().then(isOnline => changeStatus(isOnline));
    }

    window.addEventListener('online', () => changeStatus(true));
    window.addEventListener('offline', () => changeStatus(false));
  }

  return next => action => next(action);
};
