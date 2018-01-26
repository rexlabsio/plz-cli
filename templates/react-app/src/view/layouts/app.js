import React, { PureComponent } from 'react';

const styles = {
  Container: {
    boxSizing: 'border-box',
    backgroundColor: 'lightpink',
    color: '#d36f8d',
    fontSize: '2rem',
    fontWeight: '600',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
};

class AppShell extends PureComponent {
  render () {
    const { children } = this.props;
    return <div style={styles.Container}>{children}</div>;
  }
}

export default AppShell;
