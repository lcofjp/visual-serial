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
  // middlewareModal
  MIDDLEWARE_MODAL_SHOW,
  // add/remove middleware
  ADD_MIDDLEWARE,
  REMOVE_MIDDLEWARE,
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

function middlewareModal(state={show: false}, action) {
  switch(action.type) {
    case MIDDLEWARE_MODAL_SHOW:
      return {show: action.show};
    default:
      return state;
  }
}

const initialMiddlewareSet = {
  preMiddleware: [],
  postMiddleware: [],
  sendMiddleware: [],
}

function middleware(state=initialMiddlewareSet, action) {
  let dstList;
  switch(action.type) {
    case ADD_MIDDLEWARE:
      dstList = state[action.whichList];
      dstList.push(action.middlewareObject);
      return {
        ...state,
        [action.whichList]: dstList,
      }
    case REMOVE_MIDDLEWARE:
      dstList = state[action.whichList];
      const index = dstList.indexOf(action.middlewareObject);
      if (index >= 0) {
        dstList.splice(index, 1);
      }
      return {
        ...state,
        [action.whichList]: dstList,
      }
    default:
      return state;
  }
}

export default combineReducers({
  setting: serialSettingReducer,
  portList: portListReducer,
  display: displayReducer,
  status: serialStatusReducer,
  middlewareModal,
  middleware,
});
