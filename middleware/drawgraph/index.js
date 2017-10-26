const { ipcRenderer } = require('electron');
const $ = require('jquery');
const R = require('ramda');

let canvas;
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
let bufferManipulateParameters = [];
let drawGraphParameters;
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
    handleFormChange({}, e.target);
    colorPalette.blur();
  })
  colorPalette.focus();
  colorPalette[0].onblur = (e) => {
    colorPalette.detach();
  }
}
// handle form element change
function handleFormChange(e, elm) {
  const target = e.target || elm;
  let tr = target.parentElement;
  while(tr.tagName !== 'TR') {
    tr = tr.parentElement;
  }
  const index = Array.from(tbody.children).indexOf(tr);
  // 为什么用merge而不是直接赋值，是因为不想改变其缓冲区
  tableProperties[index] = R.merge(tableProperties[index]||{buf:[]})(readLineProperties(tr));
  bufferManipulateParameters = R.compose(
    R.map(o => ({
      offset: parseInt(o.offset, 10),
      LE: !o.BE,
      getFunc: dataFuncMap[o.datatype],
      setValue: v => {
        o.output.value = Number.isInteger(v) ? v : v.toPrecision(5);
        o.buf.push(v);
      }
    })),
    R.filter(o => o && o.offset.trim() !== '' && !Object.is(NaN, Number(o.offset))),
  )(tableProperties);
  // 生成绘图是所用的参数
  drawGraphParameters = R.compose(
    R.map(o => {
      return {
        buf: o.buf,
        max: o.max.trim() === '' ? undefined : Number(o.max.trim()),
        min: o.min.trim() === '' ? undefined : Number(o.min.trim()),
        color: o.color,
      }
    }),
    R.filter(o => o && o.draw),
  )(tableProperties);
}
// generate a table line (tr)
function makeLine() {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input type="checkbox" /></td>
    <td><input class="offset" type="number" /></td>
    <td><select>${optionsGen()}</select></td>
    <td><input type="checkbox" /></td>
    <td>
      <div class="color" style="display: relative;">
        <div style="display: relative; background-color: ${randomColor()}; width: 100%; height: 1rem;"></div>
      </div>
    </td>
    <td><input type="number" /></td>
    <td><input type="number" /></td>
    <td><input type="number" disabled /></td>`;
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
function resizeCanvas() {
  const vw = document.getElementById('canvas');
  const width = window.innerWidth - document.getElementById('sidebar').clientWidth - 1;
  const height = window.innerHeight - 24;
  document.getElementById('canvas-info').innerHTML = `|canvas info: width:${width},height:${height}|`;
  vw.width = width;
  vw.height = height;
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
  // 初始化canvas变量
  canvas = document.getElementById('canvas');
  // 读取已有的行的属性值
  for(let i=0, len = tbody.childElementCount-1; i<len; i++) {
    tableProperties[i] = R.merge(tableProperties[i]||{buf:[]})
    (readLineProperties(tbody.children[i]));
  }
  window.onresize = (e) => {
    resizeCanvas();
  }
  resizeCanvas();
  drawGraph();
});

// send data examples: ipcRenderer.send('serial-txdata', 'hello wins');
ipcRenderer.on('serial-rxdata', (event, data) => {
  //console.log(data);
  const dv = new DataView(data.buffer, data.offset, data.length);
  R.map(o => {
    if (o.offset < 0 || o.offset > data.length) return;
    const v = o.getFunc.call(dv, o.offset, o.LE);
    o.setValue(v);
  })(bufferManipulateParameters);
});

// drawGraphParameters[] =
// {draw, max, min, vmax, vmin, data, color}
function drawGraph() {
  const ctx = canvas.getContext('2d');
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  let maxLen;
  // clear canvas
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.fill();
  ctx.closePath();

  R.compose(
    R.map(p => {
      ctx.strokeStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0+p.startx, p.buf[0]);
      for(let i=1, len=p.buf.length; i<len; i++) {
        ctx.lineTo(i+p.startx, p.buf[i]);
      }
      ctx.stroke();
      ctx.closePath();
    }),
    R.map(p => {
      // return {startx, buf, color}
      if (p.buf.length > 20*1024) {
        p.buf = p.buf.slice(-10*1024);
      }

      let len = p.buf.length;
      if (len > maxLen) {
        len = maxLen;
      }
      let buf = p.buf.slice(-len);
      let vmax=-Infinity, vmin=Infinity;
      for(let i=0; i<len; i++) {
        if (buf[i] > vmax) vmax = buf[i];
        if (buf[i] < vmin) vmin = buf[i];
      }
      // vmax和vmin是自适应的极值， p.max和p.min是设置的极值
      const max = (p.max === undefined) ? vmax : p.max;
      const min = (p.min === undefined) ? vmin : p.min;;
      const center = (max+min)/2;
      const scale = (max===min) ? 1 : (height*0.9)/(max-min);
      return {
        buf: R.map(x => (center-x) * scale + height/2)(buf),
        startx: maxLen - buf.length,
        color: p.color,
      }
    }),
    a => {
      maxLen = -Infinity;
      for(let i=0, len=a.length; i<len; i++) {
        const p = a[i];
        if (maxLen < p.buf.length) {
          maxLen = p.buf.length;
        }
      }
      if (maxLen > width) maxLen = width;
      return a;
    },
    R.filter(o => o.buf.length > 1),
  )(drawGraphParameters||[]);
  window.requestAnimationFrame(drawGraph);
}
