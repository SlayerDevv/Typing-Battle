import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    transports: ['websocket'],
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
    },
  });

  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    const playerId = uuidv4();
    console.log(`Generated playerId for socket ${socket.id}: ${playerId}`);

    socket.on('getRoomData', ({ roomId }) => {
      const roomData = rooms.get(roomId);
      if (roomData) {
        socket.emit('roomData', roomData);
      }
    });

    socket.on("createRoom", ({ roomName, playerName, playerId }) => {
      if (rooms.has(roomName)) {
        socket.emit("roomError", { message: "Room already exists" });
        return;
      }
      if (rooms.has(playerId)){
        socket.emit("roomError", { message: "You already have room running" });
        return;
      }

      const roomData = {
        id: roomName,
        players: [{
          id: playerId,
          name: playerName,
          isHost: true
        }],
        ready: [],
        status: "waiting"
      };
      
      rooms.set(roomName, roomData);
      socket.join(roomName);
      
      io.to(roomName).emit("roomCreated", {
        roomId: roomName,
        playerId: playerId,
        playerName: playerName
      });

      io.to(roomName).emit('roomData', roomData);
    });

    socket.on("joinRoom", ({ roomName, playerName, playerId }) => {
      const roomData = rooms.get(roomName);
      
      if (!roomData) {
        socket.emit("roomError", { message: "Room not found" });
        return;
      }

      if (roomData.players.find(p => p.id === playerId)) {
        return;
      }

      if (roomData.players.length >= 2) {
        socket.emit("roomError", { message: "Room is full" });
        return;
      }

      const newPlayer = {
        id: playerId,
        name: playerName,
        isHost: false
      };

      roomData.players.push(newPlayer);
      socket.join(roomName);
      
      // Enhanced playerJoined event with complete player information
      io.to(roomName).emit("playerJoined", {
        roomId: roomName,
        playerId: playerId,
        playerName: playerName,
        players: roomData.players
      });

      io.to(roomName).emit('roomData', roomData);
    });

      socket.on("playerReady", ({ playerId, roomName}) => {
        const roomData = rooms.get(roomName);
        const player = roomData.players.find(p => p.id === playerId);
        if (player){
          if (!roomData.ready.includes(playerId)){
            roomData.ready.push(playerId);
            
          }
        }
      })

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

    socket.on('completeRace', (roomId) => {
      io.to(roomId).emit('raceCompleted', {
        winnerId: playerId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${playerId}`);
      
      // Enhanced disconnect handling with player name
      for (const [roomId, roomData] of rooms.entries()) {
        const playerIndex = roomData.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          const disconnectedPlayer = roomData.players[playerIndex];
          const wasHost = disconnectedPlayer.isHost;
          const disconnectedPlayerName = disconnectedPlayer.name;
          
          // Remove the player from the room
          roomData.players.splice(playerIndex, 1);
          
          // Reassign host if necessary
          if (wasHost && roomData.players.length > 0) {
            roomData.players[0].isHost = true;
          }
          
          if (roomData.players.length === 0) {
            rooms.delete(roomId);
          } else {
            // Send updated room data to remaining players
            io.to(roomId).emit('roomData', roomData);
          }
          
          // Enhanced disconnect notification with player name
          io.to(roomId).emit('playerDisconnected', { 
            playerId,
            playerName: disconnectedPlayerName,
            remainingPlayers: roomData.players 
          });
          
          break;
        }
      }
    });

    socket.on('updateStats', ({ roomId, playerId, stats }) => {
      const room = rooms.get(roomId);
      if (room) {
        const player = room.players.find(p => p.id === playerId);
        if (player) {
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

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};