import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate } from 'react-intl';
import './input.css';

class Input extends React.Component {
  render() {
    return (
      <div className="input-widget">
        <div className="input">
          <textarea></textarea>
          <div>
            <button className="btn btn-primary">
              <FormattedMessage id="send"></FormattedMessage>
            </button>
            <label>
              <input type="checkbox" />
              <FormattedMessage id="loopback" />
            </label>
          </div>
        </div>
        <div className="send-setting">
          <label><input type="checkbox" />末尾加\r\n</label>
          <label><input type="checkbox" /><FormattedMessage id="hex" /></label>
          <div style={{display: "inline-block"}}>
            <label><input type="checkbox" />脚本</label>
            <button>load</button>
            <button>start</button>
            <button>stop</button>
          </div>
          <label><input type="checkbox" />RTS</label>
          <label><input type="checkbox" />DTR</label>
        </div>
      </div>);
  }
}

export default Input;
