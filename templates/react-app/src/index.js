/*
|-------------------------------------------------------------------------------
| App Setup
|-------------------------------------------------------------------------------
|
| Connects the DOM to our App. Exposes core App data at DEV time.
|
| It also should be the only file that is importing the store - all other usages
| of store are through react connectors or middleware.
|
*/

import 'utils/globals';
import 'src/config';

import React from 'react';
import { render } from 'react-dom';
import store from 'src/store';
import { api } from 'utils/api-client';
import {{PASCAL_NAME}}App from 'view/app';

if (__DEV__) {
  window.app = {
    store,
    api
  };
}

const {{PASCAL_NAME}}Mount = () => <{{PASCAL_NAME}}App store={store} />;
render(<{{PASCAL_NAME}}Mount />, document.querySelector('#app'));
