import React from 'react';
import PropTypes from 'prop-types';
import Display from './display';
import Input from './input';
import './main.css';

class Main extends React.Component {
  render() {
    return (
      <div className="main">
        <Display />
        <Input />
      </div>
    )
  }
}

export default Main;
