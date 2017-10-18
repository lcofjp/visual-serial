const { ipcRenderer } = require('electron');
const $ = require('jquery');
const R = require('ramda');

let colorPalette = null;
let tbody = null;
const dataTypes = ['uint8','int8','uint16','int16','uint32','int32','float','double'];
const lineProperty = ['draw','offset','datatype','BE','color','min','max','value'];
const colors = [
  'red', 'blue', 'green', 'yellow', 'orange', 
  'dodgerblue', 'purple', 'fuchsia', 'lime', 'olive', 'navy',
  'teal', 'cyan', 'brown', 'cadetblue', 'coral'
];

const tableProperties = [];
let readBufferArguments = [];
const dataFuncMap = {
  uint8: DataView.prototype.getUint8,
  int8: DataView.prototype.getInt8,
  uint16: DataView.prototype.getUint16,
  int16: DataView.prototype.getInt16,
  uint32: DataView.prototype.getUint32,
  int32: DataView.prototype.getInt32,
  float: DataView.prototype.getFloat32,
  double: DataView.prototype.getFloat64,
}
// () => string, generate a random color.
function randomColor() {
  const len = colors.length;
  return colors[Math.floor(Math.random() * len)];
}
// generate datatype options
function optionsGen() {
  return R.compose(R.join('\n'), R.map(v=>`<option>${v}</option>`))(dataTypes);
}
// select color event handler
function selectColor(e){
  colorPalette.appendTo(e.target.parentElement);
  const colorElm = $(e.target);
  
  colorPalette[0].onclick = (e=>{
    colorElm.css('background-color', $(e.target).css('background-color'));
    colorPalette.blur();
  })
  colorPalette.focus();
  colorPalette[0].onblur = (e) => {
    colorPalette.detach();
  }
}
// handle form element change
function handleFormChange(e) {
  const target = e.target;
  let tr = target.parentElement;
  while(tr.tagName !== 'TR') {
    tr = tr.parentElement;
  }
  const index = Array.from(tbody.children).indexOf(tr);
  tableProperties[index] = readLineProperties(tr);

  readBufferArguments = R.compose(
    R.map(o => ({
      offset: Number(o.offset),
      LE: !o.BE,
      getFunc: dataFuncMap[o.datatype],
      setValue: v => o.output.value = v})),
    R.filter(o => o.offset !== '' && !Object.is(NaN, Number(o.offset))),
  )(tableProperties);
}
// generate a table line (tr)
function makeLine() {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input type="checkbox" /></td>
    <td><input type="text" /></td>
    <td><select>${optionsGen()}</select></td>
    <td><input type="checkbox" /></td>
    <td>
      <div class="color" style="display: relative;">
        <div style="display: relative; background-color: ${randomColor()}; width: 100%; height: 1rem;"></div>
      </div>
    </td>
    <td><input type="text" /></td>
    <td><input type="text" /></td>
    <td><input type="text" disabled /></td>`;
    return tr;
}
// bind color select handler to line
function bindHandlerToLine(line) {
  const colorCell = line.querySelector('.color > div');
  if (colorCell) colorCell.onclick = selectColor;
  // R.map(elm => elm.onchange = handleFormChange)(line.querySelectorAll('input, select'));
  return line;
}
// insert(add) line(tr) to table
function insertLineToTable() {
  $(bindHandlerToLine(makeLine())).insertBefore($('#add-new-line'));
}
// 读取表格行的属性值
function readLineProperties(tr) {
  const getValue = [
    e => e.checked,
    e => e.value,
    e => e.value,
    e => e.checked,
    e => $(e.firstElementChild).css('background-color'),
    e => e.value,
    e => e.value,
    e => e.value,
  ];
  return R.compose(
    R.reduce((acc, e)=>{acc[e[0]] = e[1]; return acc;}, 
      {output: tr.children[7].firstElementChild}),
    R.zip(lineProperty),
    R.map(a => a[0](a[1])),
    R.zip(getValue), 
    R.map(td => td.firstElementChild)
    )(tr.children);
}
// window / document 全局事件
document.addEventListener('DOMContentLoaded', function () {
  // 给表格添加鼠标change代理事件处理函数
  tbody = document.getElementById('tbody');
  tbody.onchange = handleFormChange;

  colorPalette = $('#color-palette').detach();
  $(".color div").click(selectColor);
  // 添加行按钮单击事件
  $('#add-new-line span').click(e => {
    insertLineToTable();
  });
  //
  tableProperties[0] = readLineProperties(tbody.firstElementChild);
  tableProperties[1] = readLineProperties(tbody.firstElementChild.nextElementSibling);
});

// send data examples: ipcRenderer.send('serial-txdata', 'hello wins');
ipcRenderer.on('serial-rxdata', (event, data) => {
  //console.log(data);
  const dv = new DataView(data.buffer, data.offset, data.length);
  R.map(o => {
    const v = o.getFunc.call(dv, o.offset, o.LE);
    o.setValue(v);
  })(readBufferArguments);
  console.log('data received');
});
