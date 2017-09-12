import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { styled, StyleSheet } from '@rexlabs/styling';

@styled(StyleSheet({
  pointer: {
    cursor: 'pointer'
  },
  title: {
    fontFamily: 'sans-serif',
    '&:hover': {
      color: 'aqua'
    }
  },
}))
class {{PASCAL_NAME}} extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
  };
  static defaultProps = {
    children: 'Welcome to Paradise'
  };

  render () {
    const { styles: s, ...rest } = this.props;
    return (
      <div {...rest}>
        <h2 {...s('title', 'pointer')}>{this.props.children}</h2>
      </div>
    )
  }
}

export default {{PASCAL_NAME}};
