import { combineReducers } from 'redux';
import {
  SETTINGCHANGE_ACTION,
  SETPORTLIST_ACTION,
  SETDISPLAYMODE_ACTION
} from './serialActions';

function serialSettingReducer(state={baudrate: 9600}, action) {
  switch(action.type) {
    case SETTINGCHANGE_ACTION:
      return {...state, ...action.setting};
    default:
      return state;
  }
}
function portListReducer(state=[], action) {
  switch(action.type) {
    case SETPORTLIST_ACTION:
      return [...action.list];
    default:
      return state;
  }
}

function displayReducer(state={displayMode: 'rawHex'}, action) {
  switch(action.type) {
    case SETDISPLAYMODE_ACTION:
      return {...state, displayMode: action.mode};
    default:
      return state;
  }
}

export default combineReducers({
  setting: serialSettingReducer,
  portList: portListReducer,
  display: displayReducer,
});
