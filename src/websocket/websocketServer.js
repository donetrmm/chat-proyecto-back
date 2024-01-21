const WebSocket = require('ws');
const signale = require('signale');

const configureWebSocket = (server, path) => {
  const wss = new WebSocket.Server({ server, path }); // Agrega la opción de la ruta aquí
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

    // Agregar nuevo cliente a la lista
    clients.push(socket);

    // Enviar mensajes acumulados en el buffer al nuevo cliente
    for (const message of messageBuffer) {
      socket.send(JSON.stringify(message));
    }

    socket.on('message', (message) => {
      const parsedMessage = JSON.parse(message);
      signale.complete(`Mensaje recibido: ${parsedMessage}`);

      // Agregar mensaje al buffer
      messageBuffer.push(parsedMessage);

      // Enviar el mensaje a todos los clientes
      broadcast(parsedMessage, socket);
    });

    socket.on('close', () => {
      signale.error('Cliente desconectado');

      // Eliminar cliente de la lista
      clients.splice(clients.indexOf(socket), 1);
    });
  });

  return wss;
};

module.exports = { configureWebSocket };
