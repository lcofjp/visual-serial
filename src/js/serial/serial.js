import SerialPort from 'serialport';

let store;
let serial;
let rxHandler;

function serialInit(store) {

}

function open() {

}

function close() {

}

function setRTSDTR() {

}

function send(buf) {
  if (serial && seial.isOpen) {
    serial.send(buf);
  }
}
