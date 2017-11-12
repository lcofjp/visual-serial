import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { switchLanguage } from './Intl/IntlActions';
import { withRouter } from 'react-router';

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleSwitchLanguage = this.handleSwitchLanguage.bind(this);
  }
  handleSwitchLanguage(e) {
    const lang = e.target.value;
    this.props.dispatch(switchLanguage(lang));
  }
  render() {
    return (
      <div>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <NavLink replace className="nav-link" activeClassName="active" to="/serial"><FormattedMessage id="serial" /></NavLink>
          </li>
          <li className="nav-item"> 
            <NavLink replace className="nav-link" activeClassName="active" to="/docs"><FormattedMessage id="doc" /></NavLink>
          </li>        
          <div style={{ marginLeft: 'auto', marginRight: '10px', alignSelf: 'center', display: 'inline-block' }} >
            <a onClick={ () => {require('electron').shell.openExternal('https://github.com/lcofjp/visual-serial');}}
              style={{marginRight: '10px', cursor: 'pointer' }}>
              <img src="./assets/svg/mark-github.svg" style={{ width: '1em', height: '1em' }} alt="GitHub" />
            </a>
            <label style={{margin: 'auto'}}>Language:</label>
            <select onChange={this.handleSwitchLanguage.bind(this)} value={this.props.locale}>
            <option value="en">English</option>
            <option value="zh">中文</option>
            </select>
          </div>
        </ul>

      </div>
    );
  }
}
// Retrieve data from store as props
function mapStateToProps(store) {
  return {
    locale: store.intl.locale,
  };
}
export default withRouter(connect(mapStateToProps)(NavBar));
