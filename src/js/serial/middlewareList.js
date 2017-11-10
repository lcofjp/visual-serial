import React from 'react';
import PropTypes from 'prop-types';
import MiddlewareItem from './middlewareItem';

class MiddlewareList extends React.Component {
  render() {
    return (
      <div className="middleware-list">
        <p className="middleware-title">{this.props.title}</p>
        <hr />
        <MiddlewareItem mname="ff-protocol-this-is-a-long-long-name" />
        <img src="./assets/svg/plus.svg" width="12" height="12" />
      </div>
    )
  }
}

MiddlewareList.propTypes = {
  title: PropTypes.string.isRequired,
}
export default MiddlewareList;
