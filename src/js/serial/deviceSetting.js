import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import R from 'ramda';
import { settingChangeAction, refreshDeviceAction } from './serialActions';
import { handleSerialOpenClose } from './serial';

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
      ...this.props.setting,
    }
    this.valueChange = this.valueChange.bind(this);
    this.refreshDevice = this.refreshDevice.bind(this);
    this.openButtonClick = this.openButtonClick.bind(this);
  }
  componentDidMount() {
    this.props.dispatch(refreshDeviceAction());
  }
  componentWillReceiveProps(nextProps) {
    const device = nextProps.setting.device;
    // 如果device不在portList列表里面，则要更新device
    if(nextProps.portList.length > 0 && (device === '' || nextProps.portList.indexOf(device) < 0)) {
      this.props.dispatch(settingChangeAction({device: nextProps.portList[0]}));
      return;
    }
    if (nextProps.portList.length === 0 && nextProps.setting.device !== '') {
      this.props.dispatch(settingChangeAction({device: ''}));
      return;
    }
  }
  refreshDevice() {
    this.props.dispatch(refreshDeviceAction());
  }
  valueChange(e) {
    const field = e.target.dataset['name'];
    this.setState({[field]: e.target.value});
    this.props.dispatch(settingChangeAction({[field]: e.target.value}));
  }
  openButtonClick() {
    handleSerialOpenClose();
  }
  render() {
    let buttonId;
    switch(this.props.status) {
      case 'opening':
        buttonId = 'opening';
        break;
      case 'closing':
        buttonId = 'closing';
        break;
      case 'opened':
        buttonId = 'close';
        break; 
      default:
        buttonId = 'open';
        break;
    }
    return (
      <div id="device-setting">
        <label><FormattedMessage id="device" />:</label>
        <select value={this.state.device} data-name="device" onChange={this.valueChange}>
          {this.props.portList.map( name => {
            return (<option key={name} value={name}>{name}</option>);
          })}
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
        <div>
          <button onClick={this.refreshDevice} className="btn btn-sm btn-primary">
            <FormattedMessage id="refresh" />
          </button>
          <button 
            className="btn btn-sm btn-primary" 
            disabled={this.props.status === 'closing' || this.props.status === 'opening'}
            onClick={ this.openButtonClick }>
            <FormattedMessage id={buttonId} />
          </button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {setting: state.serial.setting, portList: state.serial.portList, status: state.serial.status};
}
export default connect(mapStateToProps)(DeviceSetting);
