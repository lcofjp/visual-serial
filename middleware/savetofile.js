const fs = require('fs');

function save2file() {
  let filepath = 'record.bin';
  let filetype = 'bin';
  let timestamp = false;
  let id;
  let bufArr = [];
  let byteCount = 0;
  let rxStr = '';
  function entry(buf, serial, next) {
    if (filetype === 'bin') {
      bufArr.push(buf);
      byteCount += buf.length;
    }
    else {
      if (timestamp) {
        rxStr += Date.now().toString() + ':';
      }
      rxStr += buf.toString('hex');
      rxStr += '\r\n';
    }
    next(buf, serial);
  }
  function getOptions() {
    return [
      {
        name: 'filepath', type: 'savefile', label: '选择文件路径', 
      },
      {
        name: 'filetype', type: 'radio', label: '二进制', value: 'bin', checked: true,
      },
      {
        name: 'filetype', type: 'radio', label: '十六进制字符串', value: 'hex',
      },
      {
        name: 'timestamp', type: 'check', label: '时间戳(仅十六进制有效)', value: 'timestamp',
      },
      {
        type: 'text', content: `<span style="color: red;">注意：</span>务必要选择文件名和路径！不要在接收数据过程中修改选项。
        为了提高文件操作性能，每两秒保存一次。`,
      }
    ];
  }
  function config(o) {
    filepath = o.filepath;
    filetype = o.filetype;
    timestamp = o.timestamp.indexOf('timestamp') > -1 ? true : false;
    const fd = fs.openSync(filepath, 'w');
    fs.closeSync(fd);

    id = setInterval(()=> {
      if (filetype === 'bin' && bufArr.length > 0) {
        const b = Buffer.concat(bufArr, byteCount);
        fs.writeFile(filepath, b, {flag: 'a'}, e=>{});
        byteCount = 0;
        bufArr = [];
      }
      else {
        if (rxStr.length > 0) {
          fs.writeFile(filepath, rxStr, {flag: 'a'}, e=>{});
          rxStr = '';
        }
      }
    }, 2000);
  }
  function getConfig() {
    // return name:value pairs
    return {
      filepath,
      filetype,
      timestamp: timestamp?['timestamp']:[],
    }
  }
  return {
    entry,
    getOptions,
    config,
    getConfig,
  }
}
save2file.type = 'middleware';

module.exports = save2file;
