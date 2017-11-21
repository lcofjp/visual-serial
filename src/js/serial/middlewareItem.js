import React from 'react';
import PropTypes from 'prop-types';

class MiddlewareItem extends React.Component {
  render() {
    return (
      <div className="middleware-item">
        <span className="middleware-name">{this.props.dataName}</span>
        <div className="middleware-operation">
          <img src="./assets/svg/si-glyph-edit.svg" className="middleware-edit" ></img>
          <span className="middleware-delete" onClick={() => this.props.onClick(this.props.dataObject)}>&times;</span>
        </div>
      </div>
    )
  }
}

MiddlewareItem.propTypes = {
  dataName: PropTypes.string.isRequired,
  dataObject: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default MiddlewareItem;