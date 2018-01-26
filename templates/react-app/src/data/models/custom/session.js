import Generator from 'data/models/generator';
import _ from 'lodash';
import { api, setAuthToken, setAccountId } from 'utils/api-client';

export const TYPE = 'session';

const initialState = {
  ready: false,
  apiToken: null,
  user: null
};

const selectors = {
  ready: (state) => state.session.ready,
  apiToken: (state) => state.session.apiToken,
  user: (state) => state.session.user
};

const actionCreators = {
  login: {
    request: (payload, actions, dispatch, getState) =>
      new Promise(async (resolve, reject) => {
        const login = await api
          .post('/login', {
            email: payload.email,
            password: payload.password
          })
          .catch(reject);

        if (!login || !login.data || !login.data.api_token) {
          reject(new Error('Login failed'));
          return;
        }

        const apiToken = login.data.api_token;
        const init = await initSession({
          ...getState().session,
          apiToken
        }).catch(reject);
        const { user, accounts, currentAccountId } = init;

        resolve({
          apiToken,
          user,
          accounts,
          currentAccountId
        });
      }),
    reduce: {
      initial: _.identity,
      success: (state, action) => ({
        ...state,
        apiToken: action.payload.apiToken
      }),
      failure: (state) => ({
        ...state,
        apiToken: null
      })
    }
  },

  logout: {
    reduce: (state, action) => ({
      ...state,
      apiToken: null
    })
  },

  init: {
    request: (payload, actions, dispatch, getState) =>
      initSession(getState().session),
    reduce: {
      initial: _.identity,
      success: (state, action) => ({
        ...state,
        ready: true
        // Enable when we start to populate user data
        // user: action.payload.user
      }),
      failure: (state) => ({
        ...state,
        ready: true,
        apiToken: null
      })
    }
  }
};

function initSession ({ apiToken, currentAccountId }) {
  return new Promise(async (resolve, reject) => {
    // Check api token and set token and org for api client here
    resolve();
  });
}

const SessionModel = new Generator(TYPE);
const session = SessionModel.createModel({
  initialState,
  selectors,
  actionCreators
});

export default session;
