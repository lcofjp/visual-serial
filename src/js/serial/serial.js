import $ from 'jquery';
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
let displayMode;
let rawHex = '';
let rawStr = '';

const itemList = document.createElement('div');
itemList.id = 'item-container';
let itemCount = 0;
const MAX_ITEM_COUNT = 200;
const MAX_TEXT_LENGTH = 10240;
const HEXTAB = "0123456789ABCDEF";

function byteToHex(b) {
  return HEXTAB[(b&0xF0)>>4] + HEXTAB[b&0xF];
}
function bufToHex(buf) {
  let outStr = '';
  for(let i=0, len=buf.length; i<len; i++) {
    outStr += byteToHex(buf[i]) + ' ';
  }
  return outStr;
}

function display(buf, serial, next) {
  if (displayMode === 'rawHex') {
    rawHex += bufToHex(buf);
    if (rawHex.length > MAX_TEXT_LENGTH) {
      rawHex = rawHex.slice(4096);
    }
    $('#text-output').val(rawHex);
  }
  else if (displayMode === 'rawStr') {
    rawStr += buf.toString('utf8');
    if (rawStr.length > MAX_TEXT_LENGTH) {
      rawStr = rawStr.slice(4096);
    }
    $('#text-output').val(rawStr);
  }
  else if (displayMode === 'itemHex' || displayMode === 'itemStr') {
    let text;
    let div;
    if (displayMode === 'itemHex') {
      text = bufToHex(buf);
    }
    else {
      text = buf.toString('utf8');
    }
    if (itemCount < MAX_ITEM_COUNT) {
      itemCount += 1;
      div = document.createElement('div');
    }
    else {
      div = $(itemList.firstElementChild).detach().get(0);
    }
    div.innerText = text;
    itemList.appendChild(div);
    $('#item-output').html(itemList);
    itemList.scrollTop = itemList.scrollHeight;
  }
  else if (displayMode === 'none') {
    
  }
}
export function mountDisplayElement() {
  if (displayMode === 'rawHex') {
    $('#text-output').val(rawHex);
  }
  else if (displayMode === 'rawStr') {
    $('#text-output').val(rawStr);
  }
  else if (displayMode === 'itemHex' || displayMode === 'itemStr') {
    $('#item-output').html(itemList);
  }
}

export function serialInit(s) {
  store = s;
  store.subscribe(() => {
    displayMode = store.getState().serial.display.displayMode;
  });
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
    serial.on('data', (buf) => display(buf));
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
