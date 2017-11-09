import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import R from 'ramda';

const baudRates = [9600,115200,38400,57600,19200,110,300,1200,2400,4800,14400,230400,921600];
const dataBits = [8,7,6,5];
const stopBits = [1,2];
const parities = ['none', 'even', 'odd', 'mark', 'space'];
const flowControls = ['none', 'RTS/CTS', 'XON/XOFF'];

function generateOptions(list) {
  return R.map(v => <option key={v} value={v}>{v}</option>)(list);
}

class DeviceSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      device: '',
      databit: 8,
      baudrate: 115200,
      stopbit: 1,
      parity: 'none',
      flowcontrol: 'none'
    }
    this.valueChange = this.valueChange.bind(this);
  }
  valueChange(e) {
    const field = e.target.dataset['name'];
    this.setState({...this.state, [field]: e.target.value})
  }
  render() {
    return (
      <div id="device-setting">
        <label><FormattedMessage id="device" />:</label>
        <select value={this.state.device} data-name="device" onChange={this.valueChange}>
          <option>COM1</option>
        </select>
        <label><FormattedMessage id="baudrate" />:</label>
        <select value={this.state.baudrate} data-name="baudrate" onChange={this.valueChange}>
          {generateOptions(baudRates)}
        </select>
        <label><FormattedMessage id="databit" />:</label>
        <select value={this.state.databit} data-name="databit" onChange={this.valueChange}>
          {generateOptions(dataBits)}
        </select>
        <label><FormattedMessage id="stopbit" />:</label>
        <select value={this.state.stopbit} data-name="stopbit" onChange={this.valueChange}>
          {generateOptions(stopBits)}
        </select>
        <label><FormattedMessage id="parity" />:</label>
        <select value={this.state.parity} data-name="parity" onChange={this.valueChange}>
          {generateOptions(parities)}
        </select>
        <label><FormattedMessage id="flowcontrol" />:</label>
        <select value={this.state.flowcontrol} data-name="flowcontrol" onChange={this.valueChange}>
          {generateOptions(flowControls)}
        </select>
      </div>
    );
  }
}

export default DeviceSetting;
