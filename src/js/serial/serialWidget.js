import React from 'react';
import { connect } from 'react-redux';

import DeviceSetting from './deviceSetting';
import Main from './main';
import SideBar from './SideBar';
import MiddlewareModal from './middlewareModal';
import './serialWidget.css';

class SerialWidget extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div id="serial-widget">
        <SideBar />
        <Main />
        { this.props.showMiddlewareModal ? <MiddlewareModal /> : null }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    showMiddlewareModal: state.serial.middlewareModal.show,
  };
}

export default connect(mapStateToProps)(SerialWidget);
