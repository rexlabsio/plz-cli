/*
|-------------------------------------------------------------------------------
| Model Generator for Restful API
|-------------------------------------------------------------------------------
|
| Although this has configured a @rexlabs/model-generator for restful entity
| & value list endpoints, it can be used to generate models that *don't* do
| anything with an API.
|
*/

import _ from 'lodash';
import ReduxModelGenerator from '@rexlabs/model-generator';
import { api } from 'utils/api-client';

const defaultConfig = {
  entities: {
    api: {
      createItem: (type, args) => api.post(`/${type}`, args),
      fetchList: (type, args) => api.get(`/${type}`, args),
      fetchItem: (type, args, id) => api.get(`/${type}/${id}`, args),
      updateItem: (type, args, id) => api.patch(`/${type}/${id}`, args),
      trashItem: (type, args, id) => api.delete(`/${type}/${id}`, args),
      deleteItem: (type, args, id) => api.delete(`/${type}/${id}`, args),
      bulkUpdateItems: (type, args) => api.put(`/${type}`, args),
      bulkTrashItems: (type, args) => api.delete(`/${type}`, args),
      bulkDeleteItems: (type, args) => api.delete(`/${type}`, args)
    }
  },
  valueLists: {
    api: {
      fetch: type => api.get(`lists/${type}`)
    }
  }
};

export default class RestAPIModelGenerator extends ReduxModelGenerator {
  constructor (type, config = {}) {
    super(type, _.merge({}, defaultConfig, config));
  }
}
