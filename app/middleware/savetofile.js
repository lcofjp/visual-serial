function save2file() {
  function entry(buf, serial, next) {
    next(buf);
  }
  function getOptions() {
    return [
      {
        name: 'filepath', type: 'file', label: '选择文件路径', 
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
        type: 'text', content: '<span style="color: red;">注意：</span>hello world!',
      }
    ];
  }
  function config(o) {
    const n = o.timeoutValue;
    if (typeof n !== 'undefined' && n !== null){
      timeoutValue = parseInt(n, 10);
    }
  }
  return {
    entry,
    getOptions,
    config,
  }
}
save2file.type = 'middleware';

module.exports = save2file;
