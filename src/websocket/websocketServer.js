const WebSocket = require('ws');
const signale = require('signale');

const configureWebSocket = (server, path) => {
  const wss = new WebSocket.Server({ server, path });
  const clients = [];
  const messageBuffer = [];

  const broadcast = (message, sender) => {
    wss.clients.forEach((client) => {
      if (sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  wss.on('connection', (socket) => {
    signale.success('Nuevo cliente conectado');

    clients.push(socket);

    for (const message of messageBuffer) {
      socket.send(JSON.stringify(message));
    }

    socket.on('message', (message) => {
      const parsedMessage = JSON.parse(message);
      signale.complete(`Mensaje recibido: ${parsedMessage}`);

      messageBuffer.push(parsedMessage);

      broadcast(parsedMessage, socket);
    });

    socket.on('close', () => {
      signale.error('Cliente desconectado');

      clients.splice(clients.indexOf(socket), 1);
    });
  });

  return wss;
};

module.exports = { configureWebSocket };
