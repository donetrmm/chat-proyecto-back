const io = require('socket.io-client');
const socket = io('http://localhost:8080', { path: '/api/rooms' })

socket.on('connect', () => {
  console.log('Conectado al servidor de Socket.IO');
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor de Socket.IO');
});

const roomToJoin = 'testRoom';
socket.emit('joinRoom', roomToJoin);

const messageToSend = 'Hola desde el cliente';
socket.emit('message', { room: roomToJoin, message: messageToSend });

socket.on('message', (message) => {
  console.log(`Mensaje recibido en la sala ${roomToJoin}: ${message}`);
});

setTimeout(() => {
  socket.disconnect();
}, 5000);
