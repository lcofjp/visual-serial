import SerialPort from 'serialport';

import {
  serialOpening,
  serialClosing,
  serialOpened,
  serialClosed,
  refreshDeviceAction,
} from './serialActions';

let store;
let serial;
let rxHandler;

function display() {

}

export function serialInit(s) {
  store = s;
}

export function handleSerialOpenClose() {
  if (serial && serial.isOpen) {
    store.dispatch(serialClosing());
    serial.close(() => store.dispatch(serialClosed()));
  }
  else {
    let setting = store.getState().serial.setting;
    if (setting.device === '') return;
    let options = {
      autoOpen: false,
      baudRate: parseInt(setting.baudrate, 10),
      dataBits: parseInt(setting.databit, 10),
      stopBits: parseInt(setting.stopbit, 10),
      parity: setting.parity,
    };
    switch(setting.flowcontrol) {
      case 'RTS/CTS':
        options.rtscts = true;
        break;
      case 'XON/XOFF':
        options.xon = true;
        options.xoff = true;
        break;
      default:
        options.xon = false;
        options.xoff = false;
    }
    serial = new SerialPort(setting.device, options);
    store.dispatch(serialOpening());
    serial.open( err => {
      if (err) {
        serial = null;
        store.dispatch(serialClosed());
        store.dispatch(refreshDeviceAction());
      }
    });
    serial.on('open', () => store.dispatch(serialOpened()));
    serial.on('close', () => { store.dispatch(serialClosed); serial = null; })
    serial.on('error', () => {})
    serial.on('data', (buf) => console.log(buf));
  }
}

function setRTSDTR() {

}

function send(buf) {
  if (serial && seial.isOpen) {
    serial.send(buf);
  }
}

export function printStore() {
  console.log(store.getState());
}
