import classnames from 'classnames';
import React from 'react';

import Icon from '../icons/Icon.js';

const METHODS_TO_BIND = [
  'getTextboxes',
  'handleTextboxChange'
];

export default class TextboxRepeater extends React.Component {

  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getTextboxes() {
    let textboxes = this.props.textboxes.map((textbox, index) => {
      let addButton = (
        <button className="textbox-repeater__add floating-action__button"
          onClick={this.props.handleTextboxAdd.bind(textbox, index)}>
          <Icon icon="addMini" size="mini" />
        </button>
      );
      let removeButton = null;

      if (index > 0) {
        removeButton = (
          <button className="textbox-repeater__remove floating-action__button"
            onClick={this.props.handleTextboxRemove.bind(textbox, index)}>
            <Icon icon="removeMini" size="mini" />
          </button>
        );
      }

      return (
        <div className="textbox__wrapper form__row" key={index}>
          <input className="textbox"
            onChange={this.handleTextboxChange.bind(textbox, index)}
            placeholder={this.props.placeholder}
            value={textbox.value}
            type="text" />
          <div className="floating-action__group">
            {removeButton}
            {addButton}
          </div>
        </div>
      );
    });
    return textboxes;
  }

  handleTextboxChange(index, event) {
    this.props.handleTextboxChange(index, event.target.value);
  }

  render() {
    return (
      <div className="textbox-repeater">
        {this.getTextboxes()}
      </div>
    );
  }

}
