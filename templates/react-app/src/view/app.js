import React, { Component } from 'react';
import { connect } from 'react-redux';

const styles = {
  Container: {
    boxSizing: 'border-box',
    color: '#d8809a',
    fontSize: '2rem',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  Napolean: {
    borderRadius: 50,
    marginTop: 50
  }
};

@connect(({ connection, app }) => ({ connection, app }))
class {{PASCAL_NAME}}App extends Component {
  static propTypes = { };

  render () {
    return (
      <div style={styles.Container}>
        <h1>THIS IS AN APP</h1>
        <p>
          It is {this.props.app.ready ? 'ready' : 'not ready'} and incredibly
          {this.props.connection.isOnline ? 'online' : 'offline'}.
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
