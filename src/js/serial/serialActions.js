import SerialPort from 'serialport';

const RTS_ACTION = 'RTS_ACTION';
const DTR_ACTION = 'DTR_ACTION';

// serial status
export const SERIALOPENING = 'SERIALOPENING';
export const SERIALCLOSING = 'SERIALCLOSING';
export const SERIALOPENED = 'SERIALOPENED';
export const SERIALCLOSED = 'SERIALCLOSED';
// serial setting
export const SETTINGCHANGE_ACTION = 'SETTINGCHANGE_ACTION';
export const SETPORTLIST_ACTION = 'SETPORTLIST_ACTION';

// display
export const SETDISPLAYMODE_ACTION = 'SETDISPLAYMODE_ACTION';

// middlewareModal
export const MIDDLEWARE_MODAL_SHOW = 'MIDDLEWARE_MODAL_SHOW';


export function settingChangeAction(setting) {
  return {
    type: SETTINGCHANGE_ACTION,
    setting
  };
}

export function refreshDeviceAction() {
  return (dispatch) => {
      SerialPort.list((err, ports) => {
      if (err) {
        console.log(err);
        return;
      }
      const names = ports.map(p=>p.comName);
      dispatch({type: SETPORTLIST_ACTION, list: names});
    });
  };
}

export function setDisplayMode(mode) {
  return {
    type: SETDISPLAYMODE_ACTION,
    mode
  };
}

export function serialOpening() {
  return {
    type: SERIALOPENING,
    status: 'opening'
  }
}
export function serialClosing() {
  return {
    type: SERIALCLOSING,
    status: 'closing'
  }
}
export function serialOpened() {
  return {
    type: SERIALOPENED,
    status: 'opened'
  }
}
export function serialClosed() {
  return {
    type: SERIALCLOSED,
    status: 'closed'
  }
}

export function middlewareModalShow(show) {
  return {
    type: MIDDLEWARE_MODAL_SHOW,
    show,
  }
}
