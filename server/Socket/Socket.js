import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid'; // Install uuid with `npm install uuid`

let io;

export const initializeSocket = (server) => {
  // Initialize the Socket.io server
  io = new Server(server, {
    transports: ['websocket'],
    cors: {
      origin: '*', // Adjust origin in production to your specific frontend URL
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
    },
  });

  // Handle client connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Generate a unique playerId for the connected user
    const playerId = uuidv4();
    console.log(`Generated playerId for socket ${socket.id}: ${playerId}`);

    // Handle room creation or joining
    socket.on('joinRoom', (roomId) => {
      const room = io.sockets.adapter.rooms.get(roomId);

      // Check if the room already exists and has 2 players
      if (room && room.size >= 2) {
        socket.emit('roomFull', { message: 'Room is full. Please join another room.' });
        console.log(`User ${socket.id} attempted to join full room ${roomId}`);
        return;
      }

      // Join the room
      socket.join(roomId);
      console.log(`User ${playerId} joined room ${roomId}`);

      // Notify others in the room
      socket.to(roomId).emit('playerJoined', {
        playerId,
      });

      // Notify the player that they joined successfully
      socket.emit('roomJoined', { roomId, playerId });
    });

    // Handle progress updates
    socket.on('updateProgress', (data) => {
      const { roomId, progress, wpm, accuracy } = data;
      io.to(roomId).emit('progressUpdate', {
        playerId,
        progress,
        wpm,
        accuracy,
      });
    });

    // Handle race completion
    socket.on('completeRace', (roomId) => {
      io.to(roomId).emit('raceCompleted', {
        winnerId: playerId,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${playerId}`);
      io.emit('playerDisconnected', {
        playerId,
      });
    });
  });

  return io;
};

// Function to get the initialized Socket.io instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
