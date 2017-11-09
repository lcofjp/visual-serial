import React from 'react';
import PropTypes from 'prop-types';
import DisplaySetting from './displaySetting';
import { connect } from 'react-redux';
import './display.css';

class Display extends React.Component {
  render() {
    const displayElement = this.props.displayMode === 'raw' ? 
      <textarea></textarea> :
      <div style={{width: "100%", backgroundColor: 'green'}}></div>;
    return (
      <div className="display-wrapper">
        {/* <div className="display" style={{ backgroundColor: 'yellow'}}> */}
          <div id="display-area" style={{ height: this.props.height }}>
            {displayElement}
          </div>
          <DisplaySetting />
        {/* </div> */}
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
