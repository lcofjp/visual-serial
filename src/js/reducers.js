/**
 * Root Reducer
 */
import { combineReducers } from 'redux';
import { WINDOW_RESIZE } from './actions';


const windowSize = (state = { height: 400 }, action) => {
  switch (action.type) {
    case WINDOW_RESIZE: {
      return {height: action.height};
    }
    default:
      return state;
  }
};

// Import Reducers
// import app from './modules/App/AppReducer';
// import posts from './modules/Post/PostReducer';
import intl from './Intl/IntlReducer';

// Combine all reducers into one root reducer
export default combineReducers({
  // app,
  // posts,
  windowSize,
  intl,
});
