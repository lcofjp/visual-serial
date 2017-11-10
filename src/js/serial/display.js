import React from 'react';
import PropTypes from 'prop-types';
import DisplaySetting from './displaySetting';
import { connect } from 'react-redux';
import './display.css';

class Display extends React.Component {
  render() {
    const displayElement = this.props.displayMode === 'raw' ? 
      <textarea></textarea> :
      <div style={{width: "100%", backgroundColor: '#DDFFDD'}}></div>;
    return (
      <div className="display-wrapper">
        <div id="display-area" style={{ height: this.props.height }}>
          {displayElement}
        </div>
        <DisplaySetting />
      </div>
    )
  }
}
Display.propTypes = {
  height: PropTypes.number.isRequired,
};

// Retrieve data from store as props
function mapStateToProps(store) {
  const height = store.windowSize.height-250;
  return {
    height,
  };
}

export default connect(mapStateToProps)(Display);
