import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { middlewareModalShow } from './serialActions';
import './middlewareModal.css';


class MiddlewareModal extends React.Component {
  render() {
    return (
      <div id="serial-shadow-mask">
        <div id="middleware-modal" className="popup" data-operation="add-or-modify">
          <div className="header">
            <FormattedMessage id="addMiddleware" />
          </div>
          <div className="content">
            <div id="middleware-select"></div>
            <div id="middleware-options"></div>
          </div>
          <div className="footer">
            <button onClick={()=>this.props.dispatch(middlewareModalShow(false))} className="btn btn-sm btn-default cancel">
              <FormattedMessage id="cancel" />
            </button>
            <button className="btn btn-sm btn-primary ok">
              <FormattedMessage id="ok" />
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default connect()(MiddlewareModal);
