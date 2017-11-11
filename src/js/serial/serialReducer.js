import { combineReducers } from 'redux';
import {
  SETTINGCHANGE_ACTION,
  SETPORTLIST_ACTION
} from './serialActions';

function serialSettingReducer(state={baudrate: 9600}, action) {
  switch(action.type) {
    case SETTINGCHANGE_ACTION:
      return {...state, ...action.setting};
    default:
      return state;
  }
}
function portListReducer(state=['COM1', 'COM2', 'COM3'], action) {
  switch(action.type) {
    case SETPORTLIST_ACTION:
      return [...action.list];
    default:
      return state;
  }
}

export default combineReducers({
  setting: serialSettingReducer,
  portList: portListReducer
});
