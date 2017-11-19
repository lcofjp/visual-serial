import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import cuid from 'cuid';

import { middlewareModalShow } from './serialActions';
import { middlewareFactoryMap } from './middleware';
import {
  Selector,
  SaveFileControl,
  CheckBox,
  RadioBox,
  TextDisplay,
} from './middlewareFormElement';
import './middlewareModal.css';


class MiddlewareModal extends React.Component {
  constructor(props) {
    super(props);
    // 获取中间的名称，并设置select的option
    const entries = middlewareFactoryMap.entries();
    const namesComponent = [];
    for(const entry of entries) {
      // console.log(entry[0], entry[1]);
      namesComponent.push(<option key={entry[0]} value={entry[0]}>{entry[0]}</option>);
    }

    this.state = {
      middlewareName: '',
      nameOptions: namesComponent,
      middlewareOptions: [],
      middlewareInstance: null,
    };
    this.configInfo = {};
    this.middlewareChange = this.middlewareChange.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
  }
  handleOptionChange(name, op, val) {
    // op is one of set, add, remove, add/remove用于CheckBox, 其他用set
    switch(op) {
      case 'set':
        this.configInfo[name] = val;
        break;
      case 'add':
        this.configInfo[name].push(val);
        break;
      case 'remove':
        const index = this.configInfo[name].indexOf(val);
        if (index >= 0) {
          this.configInfo[name].splice(index, 1);
        }
        break;
      default:
        break;
    }
    // console.log(this.configInfo);
  }
  displayOptions(instance) {
    if (typeof instance.getOptions === 'function') {
      const options = instance.getOptions();
      this.setState({ middlewareOptions: options });
    } else {
      this.setState({ middlewareOptions: [] });
    }
  }
  constructOptionElements(cfgArr) {
    this.configInfo = cfgArr.reduce((acc, v) => {
      switch(v.type) {
        case 'radio':
          if (v.checked) acc[v.name] = v.value;
          return acc;
        case 'check':
          if (!acc[v.name]) {
            acc[v.name] = [];
          }
          if (v.checked) acc[v.name].push(v.value);
          return acc;
        case 'select':
          acc[v.name] = v.options[0];
          return acc;
        case 'savefile':
          acc[v.name] = v.defaultFileName;
          return acc;
        case 'text':
          return acc;
        default:
          return acc;
      }
    }, {});

    return cfgArr.map((opt) => {
      switch (opt.type) {
        case 'radio':
          return (<RadioBox key={cuid()} label={opt.label}
            name={opt.name} value={opt.value}
            defaultChecked={opt.checked}
            onChange={this.handleOptionChange} />);
        case 'check':
          return (<CheckBox key={cuid()} label={opt.label}
            name={opt.name} value={opt.value}
            onChange={this.handleOptionChange} />);
        case 'select':
          return (<Selector key={cuid()} name={opt.name}
            label={opt.label} options={opt.options}
            onChange={this.handleOptionChange} />);
        case 'savefile':
          return (<SaveFileControl key={cuid()} name={opt.name}
            defaultFileName={opt.defaultFileName} label={opt.label}
            onChange={this.handleOptionChange} />);
        case 'text':
          return <TextDisplay key={cuid()} text={opt.content} />;
        default:
          return null;
      }
    });
  }

  middlewareChange(e) {
    const middlewareName = e.target.value;
    const middleware = middlewareFactoryMap.get(middlewareName);
    this.setState({ middlewareName });
    if (middleware.type === 'protocol' || middleware.type === 'middleware') {
      const middlewareInstance = new middleware.factory();
      this.setState({ middlewareInstance });
      this.displayOptions(middlewareInstance);
    } else {
      this.setState({ middlewareOptions: [] });
    }
  }
  render() {
    return (
      <div id="serial-shadow-mask">
        <div id="middleware-modal" className="popup" data-operation="add-or-modify">
          <div className="header">
            <FormattedMessage id="addMiddleware" />
          </div>
          <div className="content">
            <div id="middleware-select">
              <label><FormattedMessage id="middleware" />:</label>
              <select onChange={this.middlewareChange} value={this.state.middlewareName}>
                {this.state.nameOptions}
              </select>
            </div>
            <div id="middleware-options">
              { this.constructOptionElements(this.state.middlewareOptions) }
            </div>
          </div>
          <div className="footer">
            <button onClick={() => this.props.dispatch(middlewareModalShow(false))} className="btn btn-sm btn-default cancel">
              <FormattedMessage id="cancel" />
            </button>
            <button className="btn btn-sm btn-primary ok">
              <FormattedMessage id="ok" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(MiddlewareModal);
