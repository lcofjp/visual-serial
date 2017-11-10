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
        <div className="send-setting">send settings</div>
      </div>);
  }
}

export default Input;
