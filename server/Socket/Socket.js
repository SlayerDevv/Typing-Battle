import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    transports: ["websocket"],
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  const rooms = new Map();
  // let playerId;

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Set Player ID
    socket.on("setPlayerId", (id) => {
      socket.playerId = id;
      console.log(`Generated playerId for socket Id: ${socket.id} for this player Id: ${socket.playerId}`);
    });

    // Retrieve room data and check for rejoining
    socket.on("getRoomData", ({ roomId }) => {
      const roomData = rooms.get(roomId);
      if (roomData) {
        const player = roomData.players.find((p) => p.id === socket.playerId);
        if (player && player.isDisconnected) {
          player.isDisconnected = false; // Restore player connection
          socket.join(roomId);
          console.log(`Reconnected player: ${socket.playerId}`);
        }
        socket.emit("roomData", roomData);
        console.log(`Room data sent to client for room: ${roomId}`, roomData);
      }
    });

    // Handle room creation
    socket.on("createRoom", ({ roomName, playerName, playerId,text }) => {
      if (rooms.has(roomName)) {
        socket.emit("roomError", { message: "Room already exists" });
        return;
      }

      if (rooms.has(playerId)) {
        socket.emit("roomError", { message: "You already have a room running" });
        return;
      }

      const roomData = {
        id: roomName,
        text: text,
        players: [
          {
            id: playerId,
            name: playerName,
            isHost: true,
            isDisconnected: false,  // Ensure this is added for all players
          },
        ],
        ready: [],
        status: "waiting",
      };
      console.log("Creating room with data:", roomData);
      rooms.set(roomName, roomData);

      socket.join(roomName);

      io.to(roomName).emit("roomCreated", {
        roomId: roomName,
        text: text,
        playerId: playerId,
        playerName: playerName,
      });
      io.to(roomName).emit("roomData", roomData);
      console.log("Room created with text:", text);
    });

    // Handle player joining
    socket.on("joinRoom", ({ roomName, playerName, playerId }) => {
      const roomData = rooms.get(roomName);

      if (!roomData) {
        socket.emit("roomError", { message: "Room not found" });
        return;
      }

      if (roomData.players.find((p) => p.id === playerId)) {
        return;
      }

      if (roomData.players.length >= 2) {
        socket.emit("roomError", { message: "Room is full" });
        return;
      }

      const newPlayer = {
        id: playerId,
        name: playerName,
        isHost: false,
        isDisconnected: false,  
      };

      roomData.players.push(newPlayer);
      socket.join(roomName);

      io.to(roomName).emit("playerJoined", {
        roomId: roomName,
        playerId: playerId,
        playerName: playerName,
        players: roomData.players,
      });

      io.to(roomName).emit("roomData", roomData);
    });

    // Handle player readiness
    socket.on("playerReady", ({ playerId, roomId }) => {
      let room = rooms.get(roomId);
      if (room) {
        if (!room.ready.includes(playerId)) {
          room.ready.push(playerId);
        }
        if (room.ready.length >= 2) {
          room.status = "running";
        }
        io.to(roomId).emit("roomData", room);
      }
    });

    // Handle progress updates
    socket.on("updateProgress", (data) => {
      const { roomId, progress, wpm, accuracy } = data;
      io.to(roomId).emit("progressUpdate", {
        playerId,
        progress,
        wpm,
        accuracy,
      });
    });


    
    //Handle race completion
    socket.on("completeRace", (roomId) => {
      io.to(roomId).emit("raceCompleted", {
        winnerId: playerId,
      });
    });


    
//     const activeRaces = new Map();

// socket.on("completeRace", ({ roomId, playerId }) => {
//   console.log(`\n=== Race Completion Event ===`);
//   console.log(`Player ${playerId} has completed the race in room ${roomId}`);
  
//   let raceData = activeRaces.get(roomId);
//   console.log('Current race state:', raceData || 'no active race');
  
//   // Initialize race data if it doesn't exist
//   if (!raceData) {
//     raceData = {
//       count: 0,
//       players: new Map(), // Use Map to store player data
//       startTime: Date.now(),
//       finishOrder: []
//     };
//     activeRaces.set(roomId, raceData);
//     console.log(`Initialized new race in room ${roomId}`);
//   }

//   // Check if player already finished
//   if (!raceData.players.has(playerId)) {
//     // Add player completion data
//     raceData.count += 1;
//     raceData.players.set(playerId, {
//       position: raceData.count,
//       finishTime: Date.now()
//     });
//     raceData.finishOrder.push(playerId);

//     console.log(`Player ${playerId} finished in position ${raceData.count}`);
//     console.log(`Current race status: ${raceData.count}/2 players finished`);
    
//     // Emit completion event
//     io.to(roomId).emit("raceCompleted", {
//       playerId,
//       position: raceData.count,
//       totalFinished: raceData.count
//     });

//     // Check if race is complete (2 players finished)
//     if (raceData.count === 2) {
//       console.log(`\n=== Race Complete ===`);
//       console.log(`Room ${roomId} - Final Results:`);
//       raceData.finishOrder.forEach((id, index) => {
//         console.log(`Position ${index + 1}: Player ${id}`);
//       });

//       // Emit race completion with final results
//       io.to(roomId).emit("allPlayersFinished", {
//         finishOrder: raceData.finishOrder,
//         results: Object.fromEntries(raceData.players)
//       });
//     }
//   } else {
//     const playerData = raceData.players.get(playerId);
//     console.log(`Player ${playerId} already finished in position ${playerData.position}`);
//   }
// });
    



    // Handle disconnections
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.playerId}`);
      for (let [roomId, roomData] of rooms.entries()) {
        const playerIndex = roomData.players.findIndex((p) => p.id === socket.playerId);
        if (playerIndex !== -1) {
          const disconnectedPlayer = roomData.players[playerIndex];
          disconnectedPlayer.isDisconnected = true; // Mark as disconnected

          setTimeout(() => {
            // Remove player if not reconnected within 10 seconds
            if (disconnectedPlayer.isDisconnected) {
              // Remove the player from players array
              roomData.players.splice(playerIndex, 1);
              // Find and remove the player ID from the ready array
              const readyIndex = roomData.ready.indexOf(disconnectedPlayer.id);
              if (readyIndex !== -1) {
                roomData.ready.splice(readyIndex, 1);
              }

              // Check if the disconnected player was the host
              if (disconnectedPlayer.isHost && roomData.players.length > 0) {
                // Assign a new host (first remaining player)
                roomData.players[0].isHost = true;
                console.log(`New host assigned: ${roomData.players[0].id}`);
              }
    

              roomData.status = "waiting";
              console.log(`Player ${socket.playerId} permanently removed from room ${roomId}`);
              if (roomData.players.length === 0) {
                rooms.delete(roomId);
                console.log(`Room ${roomId} deleted`);
              } else {
                io.to(roomId).emit("roomData", roomData);
              }
            }
          }, 10000); 
        }
      }
    });

    // Handle player stats updates
    socket.on("updateStats", ({ roomId, playerId, stats }) => {
      const room = rooms.get(roomId);
      if (room) {
        const player = room.players.find((p) => p.id === playerId);
        if (player) {
          io.to(roomId).emit("playerStats", {
            playerId,
            playerName: player.name,
            stats,
          });
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
