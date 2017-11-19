import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import MiddlewareItem from './middlewareItem';
import { middlewareModalShow } from './serialActions';

class MiddlewareList extends React.Component {
  render() {
    return (
      <div className="middleware-list">
        <p className="middleware-title"><FormattedMessage id={this.props.titleId} /></p>
        <hr />
        <MiddlewareItem mname="ff-protocol" />
        <div>
          <img onClick={()=>this.props.dispatch(middlewareModalShow(true))} src="./assets/svg/plus.svg" width="12" height="12" />
        </div>
      </div>
    )
  }
}

MiddlewareList.propTypes = {
  titleId: PropTypes.string.isRequired,
};

export default connect()(MiddlewareList);
