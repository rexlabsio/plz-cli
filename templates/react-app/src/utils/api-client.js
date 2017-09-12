import _ from 'lodash';
import { create } from '@rexlabs/api-client';
import config from 'config';

const clientConfig = {
  baseURL: config.API_URL
};
const api = create(clientConfig);
api.setHeader('Accept', 'application/json');
api.setHeader('Content-Type', 'application/json');
api.addResponseInterceptor(flattenResponseData);
api.addResponseInterceptor(printError);

function setAuthToken (apiToken) {
  api.setHeader('Authorization', `Bearer ${apiToken}`);
}

function setAccountId (accountId) {
  api.setHeader('X-Account-Id', accountId);
}

export { api, setAuthToken, setAccountId };

/**
 * Flattens res.data.error or res.data.data to res.data. Also hoists
 * res.data.meta to res.meta.
 */
function flattenResponseData (response) {
  if (_.isPlainObject(response.data)) {
    response.meta = response.data.meta;
    response.data = response.data.error || response.data.data;
  }
  return response;
}

function printError (response) {
  if (response.problem) {
    console.error(new Error(response.problem));
    console.log('API Error:', response.data);
  }
  return response;
}
