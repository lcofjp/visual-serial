// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const path = require('path');
const fs = require('fs');
const $ = require('jquery');
const SerialPort = require('serialport');
const _ = require('lodash/fp');
const R = require('ramda');
const cuid = require('cuid');
const { ipcMain, dialog, BrowserWindow } = require('electron').remote;
const { clipboard, shell } = require('electron');

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
  totalTxCnt: 0,
}
const hexTab = "0123456789ABCDEF";
let rxTextArea;
let rxHandlerSeq; // 接收处理序列
let txHandlerSeq; // 发送处理序列
let loopbackSeq; // loopback
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
  refreshSerialList();
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
// 刷新串口设备
function refreshSerialList() {
  // 添加串口名称
  initSerialList(ports=>{
    const $devNames = $('#device-name-select');
    $devNames.empty();
    _.map(v=>{
      $devNames.append($(`<option>${v}</option>`));
    }, ports);
  });
}
// 获取串口列表
function initSerialList(cb) {
  SerialPort.list((err, ports) =>
    {
      if (err) {
        console.log(err);
        return;
      }
      const names = ports.map(p=>p.comName);
      if(typeof cb === 'function') {
        cb(names);
      }
    }
  );
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
//
function updateDOMSerialChange(open = true) {
  if (open) {
    $('#btn-open').text('关闭').addClass('btn-positive')
      .removeClass('btn-default').removeClass('btn-warning').prop('disabled', false);
    $('#btn-send-data').addClass('btn-primary')
      .removeClass('btn-default').prop('disabled',false);
  }
  else {
    $('#btn-open').text('打开').addClass('btn-default')
      .removeClass('btn-positive').removeClass('btn-warning').prop('disabled', false);
    $('#btn-send-data').addClass('btn-default')
      .removeClass('btn-primary').prop('disabled', true);
  }
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
        updateDOMSerialChange(false);
        serial = null;
        refreshSerialList();
      }
    });
    serial.on('data', handleSerialRecieveData);
    serial.on('error', handleSerialError);
    serial.on('open', ()=>{
      updateDOMSerialChange(true);
    });
    serial.on('close', ()=>{
      updateDOMSerialChange(false);
      serial = null;
    });
  }
}
ipcMain.on('serial-txdata', (event, data) => {
  txHandlerSeq(buf, serial);
});
function handleSerialRecieveData(buf) {
  rxHandlerSeq(buf, serial);
}
function handleSerialError(err) {
  showMessage('Error', err.message);
}
// 基本设置栏 事件处理初始化
function basicSetupEventInit() {
  $('#btn-open').click(function(e){
    handleOpenClick(e);
  });
  $('#refresh-device').click(e => {
    refreshSerialList();
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
// util functions
function byteToHex(b) {
  return hexTab[(b&0xF0)>>4] + hexTab[b&0xF];
}
// hex string to buffer
function bufFromHex(input) {
  function cton(c) {
    if (c>='0' && c<='9') return c.charCodeAt(0)-0x30;
    if (c>='a' && c<='f') return c.charCodeAt(0)-0x57;
    return null;
  }
  const str = input.toLowerCase().replace(/0x/g, ' ').replace(/[^0-9a-f ]/g, ' ').trim().replace(/\s{2,}/g, ' ');
  if (str === '') return null;
  const m = R.map(v=>{
    if (v.length < 3) return v;
    else {
      return R.splitEvery(2)(v);
    }
  });
  const s = R.compose(R.map(R.curry(parseInt)(R.__,16)), R.flatten, m, R.split(' '))(str);
  return Buffer.from(s);
}
// display中间件
function display(buf, devObj, next) {
  let i;
  dataObj.totalRxCnt += buf.length;
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
    dataObj.rawStr += buf.toString('utf8');
    rxTextArea.innerHTML = dataObj.rawStr;
    rxTextArea.scrollTop = rxTextArea.scrollHeight;
  } else if (display.format === 'ITEM-HEX' || display.format === 'ITEM-STRING') {
    let str = '';
    if (display.format === 'ITEM-HEX') {
      for(i=0; i < buf.length; i++) {
        str += byteToHex(buf[i]);
        str += ' ';
      }
    } else {
      str = buf.toString('utf8');
    }
    
    if (dataObj.itemCnt < 1000) {
      var p = document.createElement('p');
      p.innerHTML = str;
      $('#display-list').append(p);
    } else { 
      var list = document.getElementById('display-list');
      $("p:first", list).detach().html(str).appendTo(list);
    }
    dataObj.itemCnt += 1;
    var area = $('#display-list')[0];
    area.scrollTop = area.scrollHeight;
  } if (display.format === 'NOT-DISPLAY') {
    next(buf, devObj);
    return;
  }
  
  statusbarSet('rxItemCount', `${dataObj.itemCnt}`);
  statusbarSet('rxByteCount', `${dataObj.totalRxCnt}`)
  next(buf, devObj);
}
display.format = 'RAW-HEX';
// 发送数据函数
function sendLast(buf, serial, next) {
  if (serial.isOpen) {
    serial.write(buf);
    dataObj.totalTxCnt += buf.length;
    statusbarSet('txByteCount', dataObj.totalTxCnt);
  }
}
// loopback function
function loopback(buf, serial, next) {
  rxHandlerSeq(buf, serial);
}

function getBufFromTxContent() {
  let buf;
  const insertRetrun = document.getElementById('insert-return').checked;
  const isHex = document.getElementById('send-hex').checked;
  const isDec = document.getElementById('send-decimal').checked;
  let str = $('#tx-content textarea').val();
  if (!isHex && !isDec) { // 直接发送字符串
    if (insertRetrun) { str = str.replace(/\n/g, '\r\n'); }
    buf = Buffer.from(str, 'utf8');
  } else if (isHex) {
    buf = bufFromHex(str);
    if(!buf) return null;
  } else if (isDec) { // to be complete

  }
  if (buf === undefined || buf.length === 0) return null;
  return buf;
}

function DOMEventInit() {
  // display format change event
  $('#display-format-select').change(function(e) {
    display.format = $(this).val();

    if (display.format === 'NOT-DISPLAY') return;

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
        const cuid = e.target.parentElement.firstElementChild.dataset['cuid'];
        deleteInstanceByCuid(cuid);
        $(lineItem).detach();
      } else if ($target.hasClass('icon-pencil')) { //编辑中间件
        const cuid = e.target.previousElementSibling.dataset['cuid'];
        middlewareDoModal(cuid);
      }
      applyMiddleware();
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

  // 中间件弹出框"确定"按钮 单击事件处理程序
  $('#middleware-popup .ok').click(e => {
    const operation = document.getElementById('middleware-popup').dataset['operation'];
    
    // 收集配置信息并配置
    const conf = getMiddlewareOptions();

    if (typeof tempMiddlewareInstance.config === 'function') {
      tempMiddlewareInstance.config(conf);
    }

    if (operation === 'add') {
      if (tempMiddlewareInstance.type === 'middleware' || tempMiddlewareInstance.type === 'protocol') {
        const name = tempMiddlewareInstance.name;
        const cuid = tempMiddlewareInstance.cuid;
        mapEditing.set(cuid, tempMiddlewareInstance);
        const divElm = document.createElement('div');
        divElm.innerHTML = name;
        divElm.classList.add('middleware-name');
        divElm.setAttribute('data-cuid', cuid);
        const line = $('<div class="middleware-line"></div>')
        .append(divElm).append('<span class="icon icon-pencil"></span>')
        .append('<span class="icon icon-down-circled"></span>')
        .append('<span class="icon icon-up-circled"></span>')
        .append('<span class="icon icon-cancel-squared"></span>');
        $('.list-editing').append(line).removeClass('list-editing');
      } else if (tempMiddlewareInstance.type === 'widget') { // add widget
        // contruct window object and entry
        const obj = {};
        obj.cuid = cuid();
        obj.name = tempMiddlewareInstance.name;
        obj.type = tempMiddlewareInstance.type;

        const modalPath = path.join('file://', tempMiddlewareInstance.path);
        let win = new BrowserWindow();
        win.on('close', function () { obj.win = null; deleteInstanceByCuid(obj.cuid, true); })
        win.loadURL(modalPath)
        win.show();

        obj.win = win;
        const entry = function (buf, serial, next) { this.win.webContents.send('serial-rxdata', buf); next(buf, serial);};
        obj.entry = entry.bind(obj);
        mapEditing.set(obj.cuid, obj);

        // add middleware-line
        const divElm = document.createElement('div');
        divElm.innerHTML = obj.name;
        divElm.classList.add('middleware-name');
        divElm.setAttribute('data-cuid', obj.cuid);
        const line = $('<div class="middleware-line"></div>')
        .append(divElm).append('<span class="icon icon-pencil"></span>')
        .append('<span class="icon icon-down-circled"></span>')
        .append('<span class="icon icon-up-circled"></span>')
        .append('<span class="icon icon-cancel-squared"></span>');
        $('.list-editing').append(line).removeClass('list-editing');
      }        
    } else if (operation === 'modify') {
      //对象已经更改，do nothing
    }
    $('#shadow-mask').hide();
    $('#middleware-popup').hide();
    applyMiddleware();
  });
  // 中间件弹出框取消按钮处理程序
  $('#middleware-popup .cancel').click(e => {
    $('.list-editing').removeClass('list-editing');
    $('#shadow-mask').hide();
    $('#middleware-popup').hide();
  });
  // 接收条目单击复制功能 click item to copy
  $('#display-list').click(e => {
    if (e.target.tagName === 'P') {
      clipboard.writeText(e.target.innerHTML);
    }
  });
  // 清空接收缓冲区和显示区域
  $('#rx-clear').click(e => {
    dataObj.totalRxCnt = 0;
    dataObj.totalTxCnt = 0;
    dataObj.itemCnt = 0;
    dataObj.rawHex = '';
    dataObj.rawStr = '';
    $('#display-list').empty();
    $('#textarea-rx')[0].innerHTML = '';
    statusbarSet('resetCount');
  });
  // send button 发送按钮click事件处理函数
  $('#btn-send-data').click(e => {
    if (serial && serial.isOpen) {
      const buf = getBufFromTxContent();
      if (buf) {
        txHandlerSeq(buf, serial);
      }
    }
  });
  // loopback button click event
  $('#btn-loopback').click(e => {
    const buf = getBufFromTxContent();
    if (buf) {
      loopbackSeq(buf, serial);
    }
  });
  // 发送选项设置
  $('#tx-setup input').change(e=> {
    if (e.target.id === 'send-hex' && e.target.checked) {
      $('#send-decimal')[0].checked =  false;
    } else if (e.target.id === 'send-decimal' && e.target.checked) {
      $('#send-hex')[0].checked = false;
    }
  });
  function setRTSDTR(pin, e) {
    const rtsChecked = document.getElementById('set-rts').checked;
    const dtrChecked = document.getElementById('set-dtr').checked;
    if (serial && serial.isOpen) {
      serial.set({rts: rtsChecked, dtr: dtrChecked,});
    } else {
      e.preventDefault();
    }
  }
  document.getElementById('set-rts').addEventListener('click', setRTSDTR.bind(null, 'rts'));
  document.getElementById('set-dtr').addEventListener('click', setRTSDTR.bind(null, 'dtr'));
}

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
        if (fs.existsSync(path.join(dirname, v, 'index.html'))){
          return true;
        }
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
  const middlewareDir = path.join(__dirname, 'middleware');
  // middlewareFactoryMap
  const mws = scanMiddlewareDir(middlewareDir);
  const cons = _.map(v => {
    if (v.type === 'js') {
      const factory = require('./'+path.join('middleware', v.name));
      return {
        factory,
        name: path.basename(v.name, path.extname(v.name)),
        type: factory.type,
      }
    }
    else if (v.type === 'dir') {
      return {
        path: path.join(middlewareDir, v.name, 'index.html'),
        name: v.name,
        type: 'widget',
      }
    }
  }, mws);
  _.map(o => {
    middlewareFactoryMap.set(o.name, o);
  }, cons);
}
// getMiddlewareOptions
function getMiddlewareOptions() {
  const optionsContainer = document.getElementById('middleware-options');
  const namedOptions = optionsContainer.querySelectorAll('[name]');
  const arr = Array.from(namedOptions);
  const config = {};
  R.map(e => {
    if (e.tagName === 'INPUT') {
      if (e.type === 'radio') {
        if (e.checked) {
          config[e.name] = e.value;
        }
      } else if (e.type === 'checkbox') {
        var arr = config[e.name] || [];
        if (e.checked) {
          arr.push(e.value);
        }
        // 必须要在if外面赋值，否则，一个都没选的话，config[e.name]就会是undefined
        config[e.name] = arr;
      } else {
        config[e.name] = e.value;
      }
    } else if (e.tagName === 'BUTTON') {
      if (e.dataset['type'] === 'savefile') {
        config[e.name] = e.dataset['value'];
      }
    } else if (e.tagName === 'SELECT') {
      config[e.name] = e.value;
    }
  })(arr);
  return config;
}
// 添加中间件的选项，给定中间件的名字，显示中间件的选项
function addMiddlewareOptions(name, inst = null) {
  // clear previous options
  $('#middleware-options').empty();

  const o = middlewareFactoryMap.get(name);
  if (typeof o === 'undefined') {
    return;
  }
  const type = o.type;
  if (type === 'middleware' || type === 'protocol') {
    const factory = middlewareFactoryMap.get(name).factory;
    const instance = inst || factory();
    let config = {};
    if (typeof instance.getConfig === 'function') {
      config = instance.getConfig();
    }
    instance.name = name;
    instance.type = type;
    tempMiddlewareInstance = instance;
    if (instance.cuid === undefined) {
      instance.cuid = cuid();
    }
    if (typeof instance.getOptions === 'function') {
      const options = instance.getOptions();
      _.map(option => {
        const curval = config[option.name];
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
          if (curval) elm.value = curval;
        } else if (option.type === 'check') {
          const label = $('<label>');
          const check = $('<input type="checkbox" >').attr('name', option.name).attr('value', option.value);;
          label.append(check).append(option.label);
          const div = $('<div>');
          div.append(label).appendTo('#middleware-options');
          if (curval.indexOf(option.value) > -1) check[0].checked = true;
        } else if (option.type === 'radio') {
          const label = $('<label></label>');
          const radio = $('<input type="radio" >').attr('name', option.name).attr('value', option.value);
          label.append(radio).append(`${option.label}`);
          const div = $('<div></div>');
          div.append(label).appendTo('#middleware-options');
          if (curval === option.value) radio[0].checked = true;
        } else if (option.type === 'savefile') {
          const text = $('<div>').css('max-width', '475px');
          const btn = $(`<button name="${option.name}" data-type="savefile" data-value="" class="btn btn-mini btn-primary">选择文件...</button>`);
          btn.click(e => dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), null, filename=>{
            if (filename) {
              text.text(filename);
              btn.attr('data-value', filename);
            }
          }));
          const div = $('<div>');
          div.append(btn).append(text).appendTo('#middleware-options');
          text.text(curval);
          btn.attr('data-value', curval);
        } else if (option.type === 'text') {
          const element = document.createElement('p');
          element.innerHTML = option.content || '';
          const div = document.createElement('div');
          $(div).css('max-width', '475px');
          div.appendChild(element);
          $('#middleware-options').append(div);
        }
      }, options);
    }
  }
  else if (type === 'widget') {
    tempMiddlewareInstance = o;
    // do nothing
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
    addMiddlewareOptions(tempMiddlewareInstance.name, tempMiddlewareInstance);
  } else {
    // 列出所有中间件的名字，供选择添加，选择某中间件后，列出其可配置选项
    document.getElementById('middleware-popup').setAttribute('data-operation', 'add');
    const selectElm = document.createElement('select');
    selectElm.addEventListener('change', (e)=>{
      const name = e.target.value;
      addMiddlewareOptions(name);
    });
    // optgroup, 中间件选项分为三组
    const grpMiddleware = $(document.createElement('optgroup')).attr('label', 'middleware');
    const grpProtocol = $(document.createElement('optgroup')).attr('label', 'protocol');
    const grpWidget = $(document.createElement('optgroup')).attr('label', 'widget');
    for(const [name, m] of middlewareFactoryMap) {
      if (m.type === 'protocol') {
        $(`<option value="${name}">${name}</option>`).appendTo(grpProtocol);
      } else if (m.type === 'middleware') {
        $(`<option value="${name}">${name}</option>`).appendTo(grpMiddleware);
      } else if (m.type === 'widget') {
        $(`<option value="${name}">${name}</option>`).appendTo(grpWidget);
      }
    }
    $(selectElm).append(grpMiddleware).append(grpProtocol).append(grpWidget);

    if (selectElm.childElementCount > 0) {
      const firstOption = selectElm.querySelector('option');
      if (firstOption !== null) {
        firstOption.selected = true;
        const name = firstOption.value;
        addMiddlewareOptions(name);
      } else {
        document.querySelector('#middleware-popup .ok').disabled = true;
      }
    } else {
      document.querySelector('#middleware-popup .ok').disabled = true;
    }
    $(header).append($('<label>选择中间件：</label>').append(selectElm));
  }
  $('#shadow-mask').css('display', 'flex');
  $('#middleware-popup').css('display', 'flex');
}

// 从middleware-line中获得cuid，查到对应的对象并应用
function applyMiddleware() {
  // rxHandlerSeq = ...
  const preElms = document.querySelectorAll('.pre-middleware-fs .middleware-name');
  const preCuids = [];
  let i;
  for(i=0; i<preElms.length; i++) {
    preCuids.push(preElms[i].dataset['cuid']);
  }
  const postElms = document.querySelectorAll('.post-middleware-fs .middleware-name');
  const postCuids = [];
  for(i=0; i<postElms.length; i++) {
    postCuids.push(postElms[i].dataset['cuid']);
  }
  const preMiddleware = _.map(cuid => {
    const m = preMiddlewareInstanceMap.get(cuid);
    if (m.type === 'middleware' || m.type === 'widget') {
      return m.entry;
    } else if (m.type === 'protocol') {
      return m.decode;
    }
  }, preCuids);
  const postMiddleware = _.map(cuid => {
    const m = postMiddlewareInstanceMap.get(cuid);
    if (m.type === 'middleware' || m.type === 'widget') {
      return m.entry;
    } else if (m.type === 'protocol') {
      return m.decode;
    }
  }, postCuids);
  rxHandlerSeq = makeSeq([...preMiddleware, display, ...postMiddleware]);
  // txHandlerSeq = ...
  const sendElms = document.querySelectorAll('.send-middleware-fs .middleware-name');
  const sendCuids = [];
  for(i=0; i<sendElms.length; i++) {
    sendCuids.push(sendElms[i].dataset['cuid']);
  }
  const sendMiddleware = _.map(cuid => {
    const m = sendMiddlewareInstanceMap.get(cuid);
    if (m.type === 'middleware' || m.type === 'widget') {
      return m.entry;
    } else if (m.type === 'protocol') {
      return m.encode;
    }
  }, sendCuids);
  txHandlerSeq = makeSeq([...sendMiddleware, sendLast]);
  loopbackSeq = makeSeq([...sendMiddleware, loopback]);
}
// 查找实例对象对应的map和instance
function getInstanceByCuid(cuid) {
  if (preMiddlewareInstanceMap.has(cuid)) {
    return [preMiddlewareInstanceMap, preMiddlewareInstanceMap.get(cuid)];
  }
  if (postMiddlewareInstanceMap.has(cuid)) {
    return [postMiddlewareInstanceMap, postMiddlewareInstanceMap.get(cuid)];
  }
  if (sendMiddlewareInstanceMap.has(cuid)) {
    return [sendMiddlewareInstanceMap, sendMiddlewareInstanceMap.get(cuid)];
  }
  return [undefined, undefined];
}
// 在实例对象映射中，删除指定cuid的对象，当中间件为widget，则有可能窗口在外面关闭，此时要删除对应的中间件item
function deleteInstanceByCuid(cuid, deleteElement = false) {
  const [map, instance] = getInstanceByCuid(cuid);
  if (instance !== undefined) {
    if (instance.type === 'widget') {
      if (instance.win) {
        instance.win.close();
      }
    }
    map.delete(cuid);
    if (deleteElement) {
      const nameElm = document.querySelector(`[data-cuid="${cuid}"]`);
      if (nameElm !== null) {
        $(nameElm.parentElement).detach();
      }
      // 如果此时串口出于打开状态，应该关闭串口，分发数据，否则程序将异常
      applyMiddleware();
    }
  }
}

function statusbarSet(item, content) {
  if (item === 'serialstatus') {
    document.getElementById('serial-status').innerHTML = content;
  } else if (item === 'rxByteCount') {
    document.getElementById('rx-byte-count').innerHTML = content;
  } else if (item === 'rxItemCount') {
    document.getElementById('rx-item-count').innerHTML = content;
  } else if (item === 'txByteCount') {
    document.getElementById('tx-byte-count').innerHTML = content;
  } else if (item === 'resetCount') {
    $('footer [id$="count"]').text('0');
  }
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
  applyMiddleware();
  updateDOMSerialChange(false);

  const packageStr = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
  const packageObj = JSON.parse(packageStr);
  const version = packageObj.version;
  $('#version').text(version);
  $.getJSON('https://lcofjp.github.io/visual-serial/version.json')
    .done(data => {
      if (data.latest_version !== version) {
        $('#version').html(`${version}(<span id="download-latest" 
        style="cursor: pointer; color: blue;"></span>)`);
        $('#download-latest').text(`下载${data.latest_version}`).show().click(e => {
          shell.openExternal("https://www.github.com/lcofjp/visual-serial/");          
        });
      }
    });

});
