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
import 'config';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { StylesProvider } from '@rexlabs/styling';
import { LayoutProvider } from '@rexlabs/box';
import { TextProvider } from '@rexlabs/text';
import { store, formStore, FormProvider } from 'store';
import { api } from 'utils/api-client';
import { initTheme, TEXTS, LAYOUTS } from 'theme';
import {{PASCAL_NAME}}App from 'view/app';

// Note: Ensure this is imported last, as it needs to inject styles last.
import ELEMENT_STYLE_COMPONENTS from 'theme/components';

if (__DEV__) {
  window.app = {
    store,
    api
  };
}

// Setup global parts of theme
initTheme();

class {{PASCAL_NAME}}Mount extends Component {
  componentDidMount () {
    // NOTE: this is just to imitate the typekit behaviour to set a class
    //  once app is mounted ... TODO: better solution or simply remove
    const root = document.getElementsByTagName('html')[0];
    root.classList.add('ready');
  }

  render () {
    return (
      <Provider store={store}>
        <FormProvider store={formStore}>
          <StylesProvider components={ELEMENT_STYLE_COMPONENTS} debug={__DEV__}>
            <LayoutProvider layout={LAYOUTS}>
              <TextProvider text={TEXTS}>
                <{{PASCAL_NAME}}App />
              </TextProvider>
            </LayoutProvider>
          </StylesProvider>
        </FormProvider>
      </Provider>
    );
  }
}

render(<{{PASCAL_NAME}}Mount />, document.querySelector('#app'));
