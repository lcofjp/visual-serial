import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DisplaySetting from './displaySetting';
import {
  setDisplayMode
} from './serialActions';
import { printStore, mountDisplayElement, unmountDisplayElement } from './serial';

import './display.css';

class ItemDisplay extends React.Component {
  render() {
    return (<div ref={elm => mountDisplayElement('item', elm)} id='item-output' style={{width: "100%", backgroundColor: '#DDFFDD'}}></div>);
  }
}
class TextDisplay extends React.Component {
  render() {
    return (<textarea ref={elm => mountDisplayElement('text', elm)} id='text-output'></textarea>);
  }
}

class Display extends React.Component {
  constructor(props) {
    super(props);
    this.clearContent = this.clearContent.bind(this);
    this.setDisplayMode = this.setDisplayMode.bind(this);
  }
  componentDidMount() {
    
  }
  componentWillUnmount() {
    unmountDisplayElement();
  }
  clearContent() {
    printStore();
  }
  setDisplayMode(e) {
    this.props.dispatch(setDisplayMode(e.target.value));
  }
  render() {
    const displayElement = this.props.displayMode.slice(0,3) === 'raw' ? 
      <TextDisplay /> : <ItemDisplay />;
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
