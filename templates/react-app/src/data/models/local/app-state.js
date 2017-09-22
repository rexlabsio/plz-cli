import Generator from 'data/models/generator';
import _ from 'lodash';

export const TYPE = 'app';

const initialState = {
  ready: false
};

const selectors = {
  isReady: state => !!_.get(state, 'app.ready')
};

const actionCreators = {
  setReady: {
    reduce: state => ({
      ...state,
      ready: true
    })
  }
};

const AppModel = new Generator(TYPE);
const app = AppModel.createModel({
  initialState,
  actionCreators,
  selectors
});

export default app;
