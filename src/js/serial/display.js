import React from 'react';
import PropTypes from 'prop-types';
import DisplaySetting from './displaySetting';
import './display.css';

class Display extends React.Component {
  //
  render() {
    const displayElement = this.props.displayMode === 'raw' ? 
      <textarea></textarea> :
      <div style={{width: "100%", backgroundColor: 'green', height: '200px'}}></div>;
    return (
      <div className="display">
        {displayElement}
        <DisplaySetting />
      </div>
    )
  }
}

export default Display;
