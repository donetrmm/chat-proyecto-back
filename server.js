const express = require('express');
const http = require('http');
const signale = require('signale');
const cors = require('cors');

// CONFIGURACIÓN WEBSOCKET Y SOCKET.IO
const { configureWebSocket } = require('./src/websocket/websocketServer');
const { configureSocketIO } = require('./src/socket.io/socketIOServer');

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

// RUTA WEBSOCKET
const wss = configureWebSocket(server, '/api/chat');

// SOCKET.IO
const io = configureSocketIO(server);

// PRUEBA IO
app.use('/api/rooms', (req, res) => {
  res.send('Socket.IO is running');
});

// LONG POLLING
const connectionsRequests = [];

app.get('/api/connections', (req, res) => {
  connectionsRequests.push(res);
});

function notifyConnections() {
  const activeConnections = wss.clients.size;
  const requests = connectionsRequests.splice(0, connectionsRequests.length);

  requests.forEach((response) => {
    response.json({ connections: activeConnections });
  });

  setTimeout(notifyConnections, 1000);
}

notifyConnections();


let messages = [];

// RUTA SHORT POLLING
app.post('/api/chat', (req, res) => {
  const { username, content, whisper, whisperTarget } = req.body;

  if (whisper) {
    const targetMessage = {
      type: 'message',
      content,
      username,
      whisper,
      whisperTarget,
    };

    const targetClient = messages.find(
      (message) => message.username === whisperTarget
    );

    if (targetClient) {
      targetClient.messages.push(targetMessage);
    } else {
      messages.push({
        username: whisperTarget,
        messages: [targetMessage],
      });
    }
  } else {
    const newMessage = {
      type: 'message',
      content,
      username,
    };

    messages.push({
      username,
      messages: [newMessage],
    });
  }

  res.status(200).json({ success: true });
});

// RUTA SHORT POLLING
app.get('/api/messages', (req, res) => {
  const { username } = req.query;
  const userMessages = messages.find((message) => message.username === username);

  if (userMessages) {
    res.status(200).json({ messages: userMessages.messages });
  } else {
    res.status(404).json({ messages: [] });
  }
});

// RUTA SHORT POLLING
app.get('/api/whisper-messages', (req, res) => {
  const { username } = req.query;
  const userMessages = messages
    .filter((message) => message.username === username)
    .map((message) => message.messages)
    .flat();

  res.status(200).json({ messages: userMessages });
});

const PORT = 8080;
server.listen(PORT, () => {
  signale.success(`Servidor corriendo en el puerto ${PORT}`);
});
