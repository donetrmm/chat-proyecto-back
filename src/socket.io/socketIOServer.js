const socketIO = require('socket.io');
const signale = require('signale');

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

function configureSocketIO(server) {
  const io = socketIO(server, { 
    path: '/api/rooms',
    cors: corsOptions,
  });

  io.on('connect', (socket) => {
    signale.success('Nuevo cliente de Socket.IO conectado');
  
    socket.on('joinRoom', (room) => {
      signale.info(`Cliente de Socket.IO se unió a la sala: ${room}`);
      socket.join(room);
    });
  
    socket.on('message', (message) => {
      // Procesar mensajes de Socket.IO
      signale.info(`Mensaje recibido desde Socket.IO: ${JSON.stringify(message)}`);
  
      // Reenviar el mensaje a todos los clientes en la sala
      io.to(message.room).emit('message', message);
    });
  
    socket.on('disconnect', () => {
      signale.error('Cliente de Socket.IO desconectado');
  
      // Dejar la sala antes de desconectar
      const rooms = Object.keys(socket.rooms);
      rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
          signale.info(`Cliente de Socket.IO dejó la sala: ${room}`);
        }
      });
    });
  });

  return io;
}

module.exports = { configureSocketIO };
