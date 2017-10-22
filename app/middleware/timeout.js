
const valuesList = [30, 50, 100, 200, 400, 800];

function TIMEOUT() {
  let timeoutValue = 50; //unit: ms
  let id = null;
  let totalByteCount = 0;
  const bufArray = [];

  function entry(buf, serial, next) {
    if (id !== null) {
      clearTimeout(id);
      id = null;
    }
    
    bufArray.push(buf);
    totalByteCount += buf.length;

    if (totalByteCount > 10240) {
      next(Buffer.concat(bufArray, totalByteCount), serial);
      bufArray.length = 0;
      totalByteCount = 0;
    }
    else {
      id = setTimeout(()=>{
        id = null;
        next(Buffer.concat(bufArray, totalByteCount), serial);
        bufArray.length = 0;
        totalByteCount = 0;
      }, timeoutValue);
    }
  }
  function getOptions() {
    return [
      {
        name: 'timeoutValue', label: '超时时间(ms)', type: 'select', 
        values: valuesList, 
      },
    ];
  }
  function config(o) {
    const n = o.timeoutValue;
    if (typeof n !== 'undefined' && n !== null){
      timeoutValue = parseInt(n, 10);
    }
  }
  function getConfig() {
    return {
      timeoutValue,
    }
  }
  return {
    entry,
    getOptions,
    config,
    getConfig,
  }
}
TIMEOUT.type = 'middleware';
module.exports = TIMEOUT;
