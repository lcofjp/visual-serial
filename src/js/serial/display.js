import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DisplaySetting from './displaySetting';
import './display.css';

class Display extends React.Component {
  render() {
    const displayElement = this.props.displayMode === 'raw' ? 
      <textarea></textarea> :
      <div style={{width: "100%", backgroundColor: '#DDFFDD'}}></div>;
    return (
      <div className="display-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
        <div id="display-area" style={{ height: this.props.height, flex: '1' }}>
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
  const height = store.windowSize.height - 250;
  return {
    height,
  };
}

export default connect(mapStateToProps)(Display);
