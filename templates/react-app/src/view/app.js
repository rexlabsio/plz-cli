import React, { Component } from 'react';
import { connect } from 'react-redux';

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
  },
  Napolean: {
    borderRadius: 50,
    marginTop: 50,
    border: 'solid 0.75rem #d8809a',
    boxShadow: '0.75rem 1rem 0 #d36f8d'
  }
};

@connect(({ connection, app }) => ({ connection, app }))
class {{PASCAL_NAME}}App extends Component {
  static propTypes = { };

  render () {
    return (
      <div style={styles.Container}>
        <p>
          {`I am ${this.props.app.ready ? 'ready' : 'not ready'} and incredibly ${this.props.connection.isOnline ? 'online' : 'offline'}.`}
        </p>
        <img
          style={styles.Napolean}
          src='http://i.imgur.com/RsPkCMv.gif'
          alt='getting ready'
        />
      </div>
    );
  }
}

export default {{PASCAL_NAME}}App;
