import React from 'react';
import { remote } from 'electron';
const { dialog, BrowserWindow } = remote;

export class TextDisplay extends React.Component {
  render() {
    return (
      <div dangerouslySetInnerHTML={{ __html: this.props.text }}>
      </div>
    );
  }
}

export class Selector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: props.options[0]};
  }
  handleChange(e) {
    this.setState({value: e.target.value});
    this.props.onChange(this.props.name, 'set', e.target.value);
  }
  render() {
    return (
      <div>
        <label>{this.props.label}
          <select onChange={this.handleChange.bind(this)} value={this.state.value}>
            {this.props.options.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
      </div>
    );
  }
}

export class CheckBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {checked: false};
  }
  handleChange(e) {
    this.setState({checked: e.target.checked});
    if (e.target.checked) {
      this.props.onChange(this.props.name, 'add', this.props.value);
    } else {
      this.props.onChange(this.props.name, 'remove', this.props.value);
    }
  }
  render() {
    return (
      <div>
        <label>
          <input name={this.props.name} type="checkbox"
            checked={this.state.checked} value={this.props.value}
            onChange={this.handleChange.bind(this)} />
          {this.props.label}
        </label>
      </div>
    );
  }
}

export class RadioBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {checked: false};
  }
  handleChange(e) {
    this.setState({checked: e.target.checked});
    this.props.onChange(this.props.name, 'set', this.props.value);
  }
  render() {
    return (
      <div>
        <label>
          <input name={this.props.name} type="radio"
            value={this.props.value} defaultChecked={this.props.defaultChecked}
            onClick={this.handleChange.bind(this)} />
          {this.props.label}
        </label>
      </div>
    );
  }
}

export class SaveFileControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {filename: props.defaultFileName};
  }
  handleClick() {
    dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), null, filename => {
      if(filename) {
        this.setState({filename});
        this.props.onChange(this.props.name, 'set', filename);
      }
    });
  }
  render() {
    return (
      <div>
        <label>{this.props.label}</label>
        <button onClick={this.handleClick.bind(this)} className="btn btn-sm btn-primary">选择文件...</button>
        <div>{this.state.filename}</div>
      </div>
    );
  }
}
