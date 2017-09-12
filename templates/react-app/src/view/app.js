import React from 'react';

const styles = {
  color: '#d8809a',
  fontSize: '2rem',
  height: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
};

export default () => (
  <div style={styles}>
    <h1>THIS IS AN APP</h1>
    <img src="http://i.imgur.com/RsPkCMv.gif" alt="getting ready" />
  </div>
);
