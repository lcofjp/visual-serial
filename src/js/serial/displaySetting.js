import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

class DisplaySetting extends React.Component {
  render() {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label>
          <FormattedMessage id="displayMode" />:
          <select>
            <option value="rawHex"><FormattedMessage id="rawHex" /></option>
            <option value="rawStr"><FormattedMessage id="rawStr" /></option>
            <option value="itemHex"><FormattedMessage id="itemHex" /></option>
            <option value="itemStr"><FormattedMessage id="itemStr" /></option>
            <option value="none"><FormattedMessage id="displayNone" /></option>
          </select>
        </label>
        <button className="btn btn-sm btn-primary" style={{ marginLeft: 'auto', marginRight: '2px' }}>
          <FormattedMessage id="clear" />
        </button>
      </div>
    );
  }
}
export default DisplaySetting;
