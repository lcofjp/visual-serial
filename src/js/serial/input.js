import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate } from 'react-intl';
import './input.css';

class Input extends React.Component {
  render() {
    return (
      <div className="input-widget">
        <div className="input">
          <div>
            <textarea />
          </div>
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
          <label><input type="checkbox" /><FormattedMessage id="append" />\r\n</label>
          <label><input type="checkbox" /><FormattedMessage id="hex" /></label>
          <label><input type="checkbox" />RTS</label>
          <label><input type="checkbox" />DTR</label>
          
          <div style={{ display: 'inline-block' }}>
            <label><input type="checkbox" /><FormattedMessage id="scriptSend" /></label>
            <button>load</button>
            <button>start</button>
            <button>stop</button>
          </div>
        </div>
      </div>);
  }
}

export default Input;
