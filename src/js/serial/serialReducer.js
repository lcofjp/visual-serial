import { combineReducers } from 'redux';
import {
  SETTINGCHANGE_ACTION,
  SETPORTLIST_ACTION,
  SETDISPLAYMODE_ACTION,
  // serial status
  SERIALOPENING,
  SERIALCLOSING,
  SERIALOPENED,
  SERIALCLOSED,
} from './serialActions';

const defaultSerialSetting = {
  baudrate: '9600',
  device: '',
  databit: '8',
  stopbit: '1',
  parity: 'none',
  flowcontrol: 'none',
}
function serialSettingReducer(state=defaultSerialSetting, action) {
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
function serialStatusReducer(state='closed', action) {
  switch(action.type) {
    case SERIALOPENING:
    case SERIALCLOSING:
    case SERIALOPENED:
    case SERIALCLOSED:
      return action.status;
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
  status: serialStatusReducer,
});
