const { ipcRenderer } = require('electron');
const $ = require('jquery');
const R = require('ramda');

let colorPalette = null;
const dataTypes = ['uint8', 'int8', 'uint16', 'int16', 'uint32', 'int32', 'float', 'double'];
const colors = [
  'red', 'blue', 'green', 'yellow', 'orange', 
  'dodgerblue', 'purple', 'fuchsia', 'lime', 'olive', 'navy',
  'teal', 'cyan', 'brown', 'cadetblue', 'coral'
];
function randomColor() {
  const len = colors.length;
  return colors[Math.floor(Math.random() * len)];
}
function optionsGen() {
  return R.compose(R.join('\n'), R.map(v=>`<option>${v}</option>`))(dataTypes);
}
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
function bindHandlerToLine(line) {
  line.querySelector('.color > div').onclick = selectColor;
  return line;
}
function insertLineToTable() {
  $(bindHandlerToLine(makeLine())).insertBefore($('#add-new-line'));
}
// window / document 全局事件
document.addEventListener('DOMContentLoaded', function () {
  // const output = document.getElementById('output');
  // output.value = "hello world";
  // console.log('ready')
  // const btnSend = document.getElementById('btn-send-data');
  // btnSend.addEventListener('click', (e) => {
  //   ipcRenderer.send('serial-txdata', 'hello wins');
  // })

  colorPalette = $('#color-palette').detach();
  $(".color div").click(selectColor);
  $('#add-new-line span').click(e => {
    insertLineToTable();
  })
});



ipcRenderer.on('serial-rxdata', (event, data) => {
  console.log(data);
});
