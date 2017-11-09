import React from 'react';
import PropTypes from 'prop-types';

class DisplaySetting extends React.Component {
  render() {
    return (
      <div>
        <label>display mode:</label>
        <select>
          <option>raw</option>
          <option>item</option>
        </select>
        <button>clear</button>
      </div>
    )
  }
}
export default DisplaySetting;
