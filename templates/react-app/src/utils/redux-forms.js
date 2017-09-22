import { combineReducers } from 'redux';
import { connect, createProvider } from 'react-redux';
import { formReducer } from '@rexlabs/form';
import { configureStore } from 'utils/redux';

const FORM_STORE_KEY = 'formStore';
function configureReduxForms () {
  return {
    formStore: configureStore(combineReducers({ form: formReducer })),
    FormProvider: createProvider(FORM_STORE_KEY)
  };
}

function connectForm (
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  options = {}
) {
  return connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    Object.assign(
      {
        storeKey: FORM_STORE_KEY
      },
      options
    )
  );
}

export { connectForm, configureReduxForms };
