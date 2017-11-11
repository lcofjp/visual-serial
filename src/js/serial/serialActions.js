import SerialPort from 'serialport';

const RTS_ACTION = 'RTS_ACTION';
const DTR_ACTION = 'DTR_ACTION';

export const SETTINGCHANGE_ACTION = 'SETTINGCHANGE_ACTION';
export const SETPORTLIST_ACTION = 'SETPORTLIST_ACTION';

const SCANPORT_ACTION = 'SCANPORT_ACTION';

const SELECTPORT_ACTION = 'SELECTPORT_ACTION';
export const SETBAUDRATE_ACTION = 'SETBAUDRATE_ACTION';


export function settingChangeAction(setting) {
  return {
    type: SETTINGCHANGE_ACTION,
    setting
  }
}

export function refreshDeviceAction() {
  return (dispatch) => {
      SerialPort.list((err, ports) => {
      if (err) {
        console.log(err);
        return;
      }
      const names = ports.map(p=>p.comName);
      console.log(ports);
      dispatch({type: SETPORTLIST_ACTION, list: names});
    });
  }
}
