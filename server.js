const express = require('express');
const http = require('http');
const signale = require('signale');
const cors = require('cors');  // Importa el paquete cors

const { configureWebSocket } = require('./src/websocket/websocketServer');
const { configureSocketIO } = require('./src/socket.io/socketIOServer');

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: 'http://localhost:3000',  // Ajusta esto según la URL de tu aplicación de React
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));  // Usa cors con las opciones especificadas

// Configura WebSocket y pasa la ruta '/api/chat'
const wss = configureWebSocket(server, '/api/chat');

// Configura Socket.IO y pasa el servidor HTTP
const io = configureSocketIO(server);

// Agrega el middleware de Socket.IO para la ruta '/api/socketio'
app.use('/api/rooms', (req, res) => {
  res.send('Socket.IO is running');
});

const PORT = 8080;

server.listen(PORT, () => {
  signale.success(`Servidor corriendo en el puerto ${PORT}`);
});
