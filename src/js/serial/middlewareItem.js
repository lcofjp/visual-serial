import React from 'react';
import PropTypes from 'prop-types';

class MiddlewareItem extends React.Component {
  render() {
    return (
      <div className="middleware-item">
        <span className="middleware-name">{this.props.mname}</span>
        <span className="middleware-delete">&times;</span>
      </div>
    )
  }
}

MiddlewareItem.propTypes = {
  mname: PropTypes.string.isRequired,
};

export default MiddlewareItem;