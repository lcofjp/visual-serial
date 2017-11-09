import React from 'react';
import DeviceSetting from './deviceSetting';
import Main from './main';
import SideBar from './SideBar';
import './serialWidget.css';

class SerialWidget extends React.Component {
  render() {
    return (
      <div id="serial-widget">
        <SideBar />
        <Main />
      </div>
    );
  }
}

export default SerialWidget;
