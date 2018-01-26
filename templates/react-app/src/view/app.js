import React, { Component } from 'react';
import { connect } from 'react-redux';
import AppLayout from 'view/layouts/app';

const styles = {
  Napolean: {
    borderRadius: 50,
    marginTop: 50,
    border: 'solid 0.75rem #d8809a',
    boxShadow: '0.75rem 1rem 0 #d36f8d'
  }
};

@connect(({ connection, session }) => ({ connection, session }))
class {{PASCAL_NAME}}App extends Component {
  render () {
    const { session, connection } = this.props;
    return (
      <AppLayout>
        <p>
          {`I am ${session.ready
            ? 'ready'
            : 'not ready'} and incredibly ${connection.isOnline
            ? 'online'
            : 'offline'}.`}
        </p>
        <img
          style={styles.Napolean}
          src="http://i.imgur.com/RsPkCMv.gif"
          alt="getting ready"
        />
      </AppLayout>
    );
  }
}

export default {{PASCAL_NAME}}App;
