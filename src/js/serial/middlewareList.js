import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import MiddlewareItem from './middlewareItem';
import {
  middlewareModalShow,
  removeMiddleware,
} from './serialActions';

class MiddlewareList extends React.Component {
  constructor(props) {
    super(props);
    this.handleRemoveClick = this.handleRemoveClick.bind(this);
  }
  handleRemoveClick(o) {
    this.props.dispatch(removeMiddleware(o.whichList, o));
  }
  render() {
    const list = this.props.middleware[this.props.titleId];
    return (
      <div className="middleware-list">
        <p className="middleware-title"><FormattedMessage id={this.props.titleId} /></p>
        <hr />
        {
          list.map((obj) => (
            <MiddlewareItem
              dataName={obj.name}
              key={obj.cuid}
              dataObject={obj}
              onClick={this.handleRemoveClick}
            />))
        }
        <div>
          <img
            onClick={()=>this.props.dispatch(middlewareModalShow(this.props.titleId))}
            src="./assets/svg/plus.svg" style={{ cursor: "pointer", margin: "0 10px 5px 10px", width: '0.8em', height: '0.8em' }}
          />
        </div>
      </div>
    )
  }
}

MiddlewareList.propTypes = {
  titleId: PropTypes.string.isRequired,
  middleware: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    middleware: state.serial.middleware,
  }
}

export default connect(mapStateToProps)(MiddlewareList);
