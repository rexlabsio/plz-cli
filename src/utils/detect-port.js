const net = require('net');
const u = require('../utils');

module.exports = (port, host) => {
  return new Promise(resolve => {
    tryListen(port, host, (_, realPort) => {
      resolve(realPort);
    });
  });
};

function tryListen (port, host, callback) {
  port = parseInt(port) || 0;
  const server = new net.Server();

  server.on('error', err => {
    u.debug('Listen %s error: %s', port, err);
    port = 0;
    server.close();
    return tryListen(port, host, callback);
  });

  server.listen({ port, host }, () => {
    port = server.address().port;
    server.close();
    u.debug('Get free port: %s', port);
    callback(null, port);
  });
}
