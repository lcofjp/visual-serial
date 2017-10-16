const {ipcRenderer} = require('electron');

// window / document 全局事件
document.addEventListener('DOMContentLoaded', function () {
  // const output = document.getElementById('output');
  // output.value = "hello world";
  // console.log('ready')
  // const btnSend = document.getElementById('btn-send-data');
  // btnSend.addEventListener('click', (e) => {
  //   ipcRenderer.send('serial-txdata', 'hello wins');
  // })
});



ipcRenderer.on('serial-rxdata', (event, data) => {
  console.log(data);
});
