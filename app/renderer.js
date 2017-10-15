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
const path = require('path');
const fs = require('fs');

const $ = require('jquery');
const SerialPort = require('serialport');
const _ = require('lodash/fp');
const cuid = require('cuid');
var remote = require('electron').remote;
var Menu = remote.Menu
var MenuItem = remote.MenuItem

// // Build our new menu
// var menu = new Menu()
// menu.append(new MenuItem({
//   label: 'Delete',
//   click: function() {
//     // Trigger an alert when menu item is clicked
//     alert('Deleted')
//   }
// }))
// menu.append(new MenuItem({
//   label: 'More Info...',
//   click: function() {
//     // Trigger an alert when menu item is clicked
//     alert('Here is more information')
//   }
// }))


// 全局变量
let serial = null; // 串口实例
const dataObj = {
  buffer: null,
  rawHex: '',
  rawStr: '',
  protocolHex: '',
  protocolStr: '',
  itemCnt: 0,
  totalRxCnt: 0,
}
const hexTab = "0123456789ABCDEF";
let rxTextArea;
let rxHandlerPre;
let tempMiddlewareInstance = null; // 当前正在编辑修改的中间件
const middlewareFactoryMap = new Map();
const preMiddlewareInstanceMap = new Map();
const postMiddlewareInstanceMap = new Map();
const sendMiddlewareInstanceMap = new Map();
let mapEditing = null;

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
// 打开/关闭串口操作
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
    var makeFF = require('./middleware/FF-protocol.js');
    
    rxHandlerPre = makeSeq([makeFF().decode,display]);
  }
}

function handleSerialRecieveData(buf) {
  rxHandlerPre(buf, serial);
}
function handleSerialError(err) {
  showMessage('Error', err.message);
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
// 中间件包装函数
function wrapFunc(func, next) {
  return function (data, devObj) {
    func(data, devObj, next);
  }
}
// 中间件连接函数
function makeSeq(seq) {
  let next = () => {};
  if (Array.isArray(seq)) {
    for(let i=seq.length-1; i >= 0; i--) {
      next = wrapFunc(seq[i], next);
    }
  }
  return next;
}

function byteToHex(b) {
  return hexTab[(b&0xF0)>>4] + hexTab[b&0xF];
}
// display中间件
function display(buf, devObj, next) {
  let i;
  if (display.format === 'RAW-HEX') {
    for(i=0; i < buf.length; i++) {
      dataObj.rawHex += byteToHex(buf[i]);
      dataObj.rawHex += ' ';
    }
    if (dataObj.rawHex.length > 2 * 1024 * 1024) {
      dataObj.rawHex = dataObj.rawHex.slice(1*1024*1024);
    }
    rxTextArea.innerHTML = dataObj.rawHex;
    rxTextArea.scrollTop = rxTextArea.scrollHeight;
  } else if (display.format === 'RAW-STRING') {
    rxTextArea.scrollTop = rxTextArea.scrollHeight;
  } else if (display.format === 'PROTOCOL-HEX') {
    let str = '';
    for(i=0; i < buf.length; i++) {
      str += byteToHex(buf[i]);
      str += ' ';
    }
    if (dataObj.itemCnt < 1000) {
      var p = document.createElement('p');
      p.innerHTML = str;
      $('#display-list').append(p);
      dataObj.itemCnt += 1;
    } else { 
      var list = document.getElementById('display-list');
      $("p:first", list).detach().html(str).appendTo(list);
    }
    var area = $('#display-list')[0];
    area.scrollTop = area.scrollHeight;
  } else if (display.format === 'PROTOCAL-STRING') {
    var area = $('#display-list')[0];
    area.scrollTop = area.scrollHeight;
  }
  
  $('#tx-content textarea').html(`${dataObj.itemCnt}`);
  next(buf, devObj);
}
display.format = 'RAW-HEX';

function DOMEventInit() {
  // display format change event
  $('#display-format-select').change(function(e) {
    display.format = $(this).val();
    // console.log(display.format);
    if (display.format.substring(0, 3) !== 'RAW') {
      $('#textarea-rx').hide();
      $('#display-list').show();
    } else {
      $('#display-list').hide();
      $('#textarea-rx').show();
    }
  });
  // window resize event
  window.addEventListener('resize', function(e) {
    let height = window.innerHeight - 160 - 24 - 10-44;
    $('#rx-display-area').css('height', height);
  });

  // 中间件上移、下移、删除、编辑
  $('.list-container').click((e) => {
    let $target = $(e.target);
    if (e.target.tagName === 'SPAN') {
      const lineItem = e.target.parentElement;

      if ($target.hasClass('icon-down-circled')) { // 下移
        let next = lineItem.nextElementSibling;
        next && $(lineItem).detach().insertAfter(next);
      } else if ($target.hasClass('icon-up-circled')) { // 上移
        let pre = lineItem.previousElementSibling;
        pre && $(lineItem).detach().insertBefore(pre);
      } else if ($target.hasClass('icon-cancel-squared')) { // 删除
        $(lineItem).detach();
      } else if ($target.hasClass('icon-pencil')) { //编辑中间件
        const cuid = e.target.previousElementSibling.dataset['cuid'];
        middlewareDoModal(cuid);
      }
    }
  });

  // 中间件添加按钮
  $('.add-middleware').click((e)=>{
    const type = e.target.dataset['type'];
    e.target.previousElementSibling.classList.add('list-editing');
    switch(type) {
      case 'pre-middleware':
        mapEditing = preMiddlewareInstanceMap;
        break;
      case 'post-middleware':
        mapEditing = postMiddlewareInstanceMap;
        break;
      case 'send-middleware':
        mapEditing = sendMiddlewareInstanceMap;
        break;
      default:
        return;
    }
    middlewareDoModal();
  });

  // 中间件弹出框确定按钮 单击事件处理程序
  $('#middleware-popup .ok').click(e => {
    const operation = document.getElementById('middleware-popup').dataset['operation'];
    
    // 收集配置信息并配置
    const options = document.querySelectorAll('#middleware-options [name]');
    const conf = {};
    for(let i=0; i<options.length; i++) {
      const elm = options[i];
      conf[elm.getAttribute('name')] = elm.value;
    }
    tempMiddlewareInstance.config(conf);

    if (operation === 'add') {
      const name = tempMiddlewareInstance.name;
      const cuid = tempMiddlewareInstance.cuid;
      mapEditing.set(cuid, tempMiddlewareInstance);
      const divElm = document.createElement('div');
      divElm.innerHTML = name;
      divElm.classList.add('middleware-name');
      divElm.setAttribute('data-cuid', cuid);
      const line = $('<div class="middleware-line"></div>').append(divElm).append('<span class="icon icon-pencil"></span>')
      .append('<span class="icon icon-down-circled"></span>')
      .append('<span class="icon icon-up-circled"></span>')
      .append('<span class="icon icon-cancel-squared"></span>');
      $('.list-editing').append(line).removeClass('list-editing');
      $(line).mouseover((e)=>{
        $(e.currentTarget).children('span').show();
      });
      $(line).mouseout((e)=>{
        $(e.currentTarget).children('span').hide();
      });
    } else if (operation === 'modify') {

    }
    $('#shadow-mask').hide();
    $('#middleware-popup').hide();
  });
  // 中间件弹出框取消按钮处理程序
  $('#middleware-popup .cancel').click(e => {
    $('#shadow-mask').hide();
    $('#middleware-popup').hide();
  })
}

// window / document 全局事件
document.addEventListener('DOMContentLoaded', function () {
  $('.titlebar-close').click(e=>{
    window.close();
  });
  rxTextArea = document.querySelector('#textarea-rx');
  basicSetupInit();
  DOMEventInit();
  let height = window.innerHeight - 160 - 24 - 10 - 44;
  $('#rx-display-area').css('height', height);

  importMiddleware();
});

// 消息提示
function showMessage(title='Message', content='') {
  $('#shadow-mask').css('display', 'flex');
  $('#message-popup .title').html(_.escape(title));
  $('#message-popup .content').html(_.escape(content));
  $('#message-popup').css('display', 'flex');
  $('#message-popup button').click(e => {
    $('#shadow-mask').hide();
    $('#message-popup').hide();
  });
}

// 扫描midlleware文件夹，返回其中的js文件和文件夹
function scanMiddlewareDir(dirname) {
  if (fs.existsSync(dirname)) {
    const files = fs.readdirSync(dirname);
    return _(files).filter(v => {
      const stats = fs.statSync(path.join(dirname, v));
      if (stats.isDirectory()) {
        return true;
      } else {
        if (path.extname(v).toLowerCase() === '.js') {
          return true;
        }
      }
      return false;
    }).map(v => {
      const stats = fs.statSync(path.join(dirname, v));
      if (stats.isFile()) {
        return {type: 'js', name: v};
      } else if (stats.isDirectory()) {
        return {type: 'dir', name: v};
      }
    }).value();
  } else {
    return [];
  }
}
// import middleware => [mwConstructor1, Constructor2...]
function importMiddleware() {
  // middlewareFactoryMap
  const mws = scanMiddlewareDir('./middleware');
  const cons = _.map(v => {
    if (v.type === 'js') {
      const factory = require('./' + path.join('./middleware', v.name));
      return {
        factory,
        name: path.basename(v.name, path.extname(v.name)),
        type: factory.type,
      }
    }
    else if (v.type === 'dir') {
      return {
        path: path.join('./middleware', v.name),
        name: v.name,
        type: 'widget',
      }
    }
  }, mws);
  _.map(o => {
    middlewareFactoryMap.set(o.name, o);
  }, cons);
}

// 添加中间件的选项，给定中间件的名字，显示中间件的选项
function addOptions(name, inst = null) {
  // clear old options
  $('#middleware-options').empty();

  const o = middlewareFactoryMap.get(name);
  if (typeof o === 'undefined') {
    return;
  }
  const type = o.type;
  if (type === 'middleware' || type === 'protocol') {
    const factory = middlewareFactoryMap.get(name).factory;
    const instance = inst || factory();
    instance.name = name;
    tempMiddlewareInstance = instance;
    if (instance.cuid === undefined) {
      instance.cuid = cuid();
    }
    if (typeof instance.getOptions === 'function') {
      const options = instance.getOptions();
      _.map(option => {
        if (option.type === 'select') {
          const elm = document.createElement('select');
          elm.setAttribute('name', option.name);
          const values = option.values;
          _.map(x => {
            const op = document.createElement('option');
            op.innerHTML = x;
            elm.appendChild(op);
          }, values);
          const label = document.createElement('label');
          label.innerHTML = (option.label || '') + ':';
          label.appendChild(elm);
          const div = document.createElement('div');
          div.appendChild(label);
          $('#middleware-options').append(div);
          // 设置当前值
          if (option.currentValue) {
            elm.value = option.currentValue;
          }
        } else if (option.type === 'text') {

        } else if (option.type === 'check') {

        } // ...
      }, options);
    }
  }
}
// 添加middleware或者修改middleware
function middlewareDoModal(cuid = null) {
  const header = document.getElementById('middleware-select');
  header.innerHTML = '';
  if (cuid) {
    document.getElementById('middleware-popup').setAttribute('data-operation', 'modify');
    tempMiddlewareInstance = preMiddlewareInstanceMap.get(cuid);
    if (!tempMiddlewareInstance) tempMiddlewareInstance = postMiddlewareInstanceMap.get(cuid);
    if (!tempMiddlewareInstance) tempMiddlewareInstance = sendMiddlewareInstanceMap.get(cuid);
    $(header).append(`<label>更改中间件：${tempMiddlewareInstance.name}</label>`);
    addOptions(tempMiddlewareInstance.name, tempMiddlewareInstance);
  } else {
    // 列出所有中间件的名字，供选择添加，选择某中间件后，列出其可配置选项
    document.getElementById('middleware-popup').setAttribute('data-operation', 'add');
    const selectElm = document.createElement('select');
    selectElm.addEventListener('change', (e)=>{
      const name = e.target.value;
      addOptions(name);
    });

    for(const name of middlewareFactoryMap.keys()) {
      $(`<option>${name}</option>`).appendTo(selectElm);
    }
    if (selectElm.children.length > 0) {
      selectElm.firstElementChild.selected = true;
      const name = selectElm.firstElementChild.value;
      addOptions(name);
    }
    $(header).append($('<label>选择中间件：</label>').append(selectElm));
  }
  $('#shadow-mask').css('display', 'flex');
  $('#middleware-popup').css('display', 'flex');
}
