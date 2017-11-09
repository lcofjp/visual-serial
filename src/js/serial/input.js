import React from 'react';
import PropTypes from 'prop-types';
import './input.css';

class Input extends React.Component {
  render() {
    return (
      <div className="input-widget">
        <div className="input">
          <textarea></textarea>
          <div>
            <button className="btn btn-primary">send</button>
            <label><input type="checkbox" />loopback</label>
          </div>
        </div>
        <div className="send-setting">send settings</div>
      </div>);
  }
}

export default Input;
