import React from 'react';
import PropTypes from 'prop-types';
import DeviceSetting from './deviceSetting';
import './sidebar.css';

class SideBar extends React.Component {
  render() {
    return (
      <div className="sidebar">
        <DeviceSetting />
      </div>
    )
  }
}

export default SideBar;
