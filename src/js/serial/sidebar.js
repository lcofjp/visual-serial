import React from 'react';
import PropTypes from 'prop-types';
import DeviceSetting from './deviceSetting';
import MiddlewareList from './middlewareList';
import { printStore } from './serial';
import './sidebar.css';

class SideBar extends React.Component {
  render() {
    return (
      <div>
        <DeviceSetting />
        <MiddlewareList titleId="preMiddleware" />
        <MiddlewareList titleId="postMiddleware" />
        <MiddlewareList titleId="sendMiddleware" />
        <button onClick={()=>printStore()}>show store</button>
      </div>
    );
  }
}

export default SideBar;
