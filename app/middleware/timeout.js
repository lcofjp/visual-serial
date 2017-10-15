
const valuesList = [30, 50, 100, 200, 400, 800];

function TIMEOUT() {
  let timeoutValue = 50; //unit: ms
  function entry(buf, serial, next) {
    next(buf);
  }
  function getOptions() {
    return [
      {
        name: 'timeoutValue', label: '超时时间(ms)', type: 'select', 
        values: valuesList, currentValue: timeoutValue, 
      },
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
    type: 'middleware',
  }
}
TIMEOUT.type = 'middleware';
module.exports = TIMEOUT;
