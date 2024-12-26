import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid'; // Install uuid with `npm install uuid`

let io;

export const initializeSocket = (server) => {
  // Initialize the Socket.io server
  io = new Server(server, {
    transports: ['websocket'],
    cors: {
      origin: 'http://localhost:3000', // Adjust origin in production to your specific frontend URL
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
    },
  });

  const rooms = new Map();

  // Handle client connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Generate a unique playerId for the connected user
    const playerId = uuidv4();
    console.log(`Generated playerId for socket ${socket.id}: ${playerId}`);

    // Handle room data requests
    socket.on('getRoomData', ({ roomId }) => {
      const roomData = rooms.get(roomId);
      if (roomData) {
        socket.emit('roomData', roomData);
      }
    });

    socket.on("createRoom", ({ roomName, playerName, playerId }) => {
      // Check if room already exists
      if (rooms.has(roomName)) {
        socket.emit("roomError", { message: "Room already exists" });
        return;
      }

      const roomData = {
        id: roomName,
        players: [{
          id: playerId,
          name: playerName,
          isHost: true
        }],
        status: "waiting"
      };
      
      rooms.set(roomName, roomData);
      socket.join(roomName);
      
      io.to(roomName).emit("roomCreated", {
        roomId: roomName,
        playerId: playerId,
        playerName: playerName
      });

      // Emit room data to all players in the room
      io.to(roomName).emit('roomData', roomData);
    });

    socket.on("joinRoom", ({ roomName, playerName, playerId }) => {
      const roomData = rooms.get(roomName);
      
      if (!roomData) {
        socket.emit("roomError", { message: "Room not found" });
        return;
      }

      // Check if player is already in the room
      if (roomData.players.find(p => p.id === playerId)) {
        return; // Player already in room, do nothing
      }

      if (roomData.players.length >= 2) {
        socket.emit("roomError", { message: "Room is full" });
        return;
      }

      roomData.players.push({
        id: playerId,
        name: playerName,
        isHost: false
      });

      socket.join(roomName);
      
      io.to(roomName).emit("playerJoined", {
        roomId: roomName,
        playerId: playerId,
        playerName: playerName,
        players: roomData.players
      });

      // Emit updated room data to all players in the room
      io.to(roomName).emit('roomData', roomData);
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
      
      // Find and update the room this player was in
      for (const [roomId, roomData] of rooms.entries()) {
        const playerIndex = roomData.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          const wasHost = roomData.players[playerIndex].isHost;
          roomData.players.splice(playerIndex, 1);
          
          // If the disconnected player was host and there are remaining players
          if (wasHost && roomData.players.length > 0) {
            roomData.players[0].isHost = true;
          }
          
          // If room is empty, delete it
          if (roomData.players.length === 0) {
            rooms.delete(roomId);
          } else {
            // Update room data for remaining players
            io.to(roomId).emit('roomData', roomData);
          }
          
          // Notify other players about disconnection
          io.to(roomId).emit('playerDisconnected', { playerId });
          break;
        }
      }
    });

    // Add this to your existing socket handlers
    socket.on('updateStats', ({ roomId, playerId, stats }) => {
      const room = rooms.get(roomId);
      if (room) {
        const player = room.players.find(p => p.id === playerId);
        if (player) {
          // Broadcast stats to all players in the room
          io.to(roomId).emit('playerStats', {
            playerId,
            playerName: player.name,
            stats
          });
        }
      }
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
