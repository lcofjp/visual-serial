import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DisplaySetting from './displaySetting';
import {
  setDisplayMode
} from './serialActions';
import { printStore, mountDisplayElement } from './serial';

import './display.css';

class Display extends React.Component {
  constructor(props) {
    super(props);
    this.clearContent = this.clearContent.bind(this);
    this.setDisplayMode = this.setDisplayMode.bind(this);
  }
  componentDidMount() {
    mountDisplayElement();
  }
  clearContent() {
    printStore();
  }
  setDisplayMode(e) {
    this.props.dispatch(setDisplayMode(e.target.value));
  }
  render() {
    const displayElement = this.props.displayMode.slice(0,3) === 'raw' ? 
      <textarea id='text-output'></textarea> :
      <div id='item-output' style={{width: "100%", backgroundColor: '#DDFFDD'}}></div>;
    return (
      <div className="display-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
        <div id="display-area" style={{ height: this.props.height, flex: '1' }}>
          {displayElement}
        </div>
        <DisplaySetting mode={this.props.displayMode}
          onDisplayModeChange={this.setDisplayMode} onClearClick={this.clearContent} />
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
    ...store.serial.display,
  };
}

export default connect(mapStateToProps)(Display);
