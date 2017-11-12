import React from 'react';
import PropTypes from 'prop-types';
import DeviceSetting from './deviceSetting';
import MiddlewareList from './middlewareList';
import './sidebar.css';

class SideBar extends React.Component {
  render() {
    return (
      <div>
        <DeviceSetting />
        <MiddlewareList title="pre middleware" />
        <MiddlewareList title="post middleware" />
        <MiddlewareList title="send middleware" />
      </div>
    );
  }
}

export default SideBar;
