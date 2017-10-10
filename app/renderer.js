// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// const BrowserWindow = require('electron').remote.BrowserWindow
// const newWindowBtn = document.getElementById('frameless-window')

// const path = require('path')

// newWindowBtn.addEventListener('click', function (event) {
//   const modalPath = path.join('file://', __dirname, '../../sections/windows/modal.html')
//   let win = new BrowserWindow({ frame: false })
//   win.on('close', function () { win = null })
//   win.loadURL(modalPath)
//   win.show()
// })
const $ = require('jquery');
const SerialPort = require('serialport');
const _ = require('lodash/fp');
var remote = require('electron').remote;
var Menu = remote.Menu
var MenuItem = remote.MenuItem

// Build our new menu
var menu = new Menu()
menu.append(new MenuItem({
  label: 'Delete',
  click: function() {
    // Trigger an alert when menu item is clicked
    alert('Deleted')
  }
}))
menu.append(new MenuItem({
  label: 'More Info...',
  click: function() {
    // Trigger an alert when menu item is clicked
    alert('Here is more information')
  }
}))

// Add the listener
// document.addEventListener('DOMContentLoaded', function () {
//   document.querySelector('.js-context-menu').addEventListener('click', function (event) {
//     console.log('clicked');
//     menu.popup(remote.getCurrentWindow());
//   })
// })

// 全局变量
let serial = null; // 串口实例
const dataObj = {
  buffer: null,
  rawStrForHtml: '',
  hexStr: '',
  items: {},
  totalRxCnt: 0,
}
const hexTab = "0123456789ABCDEF";
let rxTextArea;

// 初始化基本设置栏
const basicSetupSelectors = ['baudrate-select', 'databits-select', 'stopbits-select', 'parity-select', 'flowcontrol-select'];
function basicSetupFormInit() {
  const baudRates = [9600,115200,38400,57600,19200,110,300,1200,2400,4800,14400,230400,921600];
  const dataBits = [8,7,6,5];
  const stopBits = [1,2];
  const parities = ['none', 'even', 'odd', 'mark', 'space'];
  const flowControls = ['无', 'RTS/CTS', 'XON/XOFF'];  
  // 获取串口名称
  initSerialList(ports=>{
    const $devNames = $('#device-name-select');
    $devNames.empty();
    _.map(v=>{
      $devNames.append($(`<option>${v}</option>`));
    }, ports);
  });
  // 初始化默认波特率
  // 初始化停止位
  // 初始化校验位
  // 初始化控制流
  const arrs = [baudRates, dataBits, stopBits, parities, flowControls];
  _.map(a=>{
    const $elm = $('#'+a[1]);
    $elm.empty();
    _.map(v=>{
      $elm.append(`<option>${v}</option>`)
    }, a[0]);
  }, _.zip(arrs, basicSetupSelectors));
}
// 获取串口列表
function initSerialList(cb) {
  SerialPort.list()
  .then(ports=>{
    const names = ports.map(p=>p.comName);
    if(typeof cb === 'function') {
      cb(names);
    }
  }) 
  .catch(err=>console.log(err));
}
function getBasicOptions() {
  const selectors = _.concat('device-name-select', basicSetupSelectors);
  const dict = {};
  _.map(id=>{
    dict[id] = $('#'+id).val();
  }, selectors);
  const options = {
    autoOpen: false,
    path: dict['device-name-select'],
    baudRate: parseInt(dict['baudrate-select'], 10),
    dataBits: parseInt(dict['databits-select'], 10),
    stopBits: parseInt(dict['stopbits-select'], 10),
    parity: dict['parity-select'],
  };
  switch(dict['flowcontrol-select']) {
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
  return options;
}
function handleOpenClick(e) {
  const $btn = $(e.target);
  $btn.prop('disabled', true);
  if (serial && serial.isOpen) { // 打开状态，做关闭动作
    $btn.removeClass('btn-positive').addClass('btn-warning').html('关闭中');
    serial.close(err=>{if(err)console.log(err)});
  }
  else {
    const options = getBasicOptions();
    const devName = options.path;
    delete options.path;
    serial = new SerialPort(devName, options);
    $btn.removeClass('btn-default').addClass('btn-warning').html('打开中');
    serial.open(err=>{
      if(err) {
        console.log('open serial port failed!', err);
      }
    });
    serial.on('data', handleSerialRecieveData);
    serial.on('error', handleSerialError);
    serial.on('open', ()=>{
      $btn.removeClass('btn-warning').removeClass('btn-default').addClass('btn-positive').html('关闭');
      $btn.prop('disabled', false);
    });
    serial.on('close', ()=>{
      $btn.removeClass('btn-warning').removeClass('btn-positive').addClass('btn-default').html('打开');
      $btn.prop('disabled', false);
      serial = null;
    });
  }
}
function byteToHex(b) {
  return hexTab[(b&0xF0)>>4] + hexTab[b&0xF];
}
function handleSerialRecieveData(buf) {
  const u8a = new Uint8Array(buf);
  dataObj.totalRxCnt += buf.byteLength;
  for(const b of buf) {
    dataObj.hexStr += ' ' + byteToHex(b);
  }
  rxTextArea.innerHTML = dataObj.hexStr;
  rxTextArea.scrollTop = rxTextArea.scrollHeight;
  $('#tx-content > textarea').html(`${dataObj.totalRxCnt}`);
}
function handleSerialError(err) {
  console.log('handleSerialError: ', err);
}
// 基本设置栏 事件处理初始化
function basicSetupEventInit() {
  const $openButton = $('#open-device');
  $openButton.click(function(e){
    handleOpenClick(e);
  });
}
// 基本设置栏设置入口
function basicSetupInit() {
  basicSetupFormInit();
  basicSetupEventInit();
}

function wrapFunc(func, next) {
  return function (data, devObj) {
    func(data, devObj, next);
  }
}
function makeSeq(seq) {
  let next = () => {};
  if (Array.isArray(seq)) {
    for(let i=seq.length-1; i >= 0; i--) {
      next = wrapFunc(seq[i], next);
    }
  }
  return next;
}

function display(data, devObj, next) {

}
display.format = "item";


var shandle = makeSeq([m1, m2, m3, m1, m1]);
// window / document 全局事件
document.addEventListener('DOMContentLoaded', function () {
  $('.titlebar-close').click(e=>{
    window.close();
  });
  rxTextArea = document.querySelector('#rx-content > textarea');
  basicSetupInit();
  shandle([1,2,3,4,5], null);
});



