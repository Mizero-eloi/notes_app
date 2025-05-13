// backend/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const db = require('./models');
const noteRoutes = require('./routes/noteRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow connections from mobile clients
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/notes', noteRoutes);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A client connected', socket.id);
  
  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

// Make Socket.IO instance available to routes
app.set('io', io);

// Sync database and start server
const PORT = process.env.PORT || 3000;

db.sequelize.sync()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });