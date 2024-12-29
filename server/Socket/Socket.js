import { Server } from "socket.io";
import { v4 as uuidv4, v7 as uuidv7 } from "uuid";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    transports: ["websocket"],
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  const rooms = new Map();
  let playerId;
  let sessionId;
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("setPlayerId", (id) => {
      playerId = id;
      console.log(
        `Generated playerId for socket Id " ${socket.id} ": for this player Id " ${playerId} "`
      );
    });

    /*      for (let [roomId, roomData] of rooms.entries()) {
        const pId = roomData.disconnectedPlayers.find(p => p.id === playerId);
        if (pId) {
          roomData.disconnectedPlayers.splice(0, 1);
          roomData.players.push(pId);
          io.to(roomId).emit("roomData", roomData);
        }
      }*/
    socket.on("validateSession", ({ sessionId, playerId }) => {
      let roomData;
      let isValid = false;
      for (let [roomId, data] of rooms.entries()) {
        if (data.sessionId === sessionId) {
          roomData = data;
          isValid = true;
          break; // Exit the loop once the room is found
        }
      }
      if (isValid) {
        const player = roomData.disconnectedPlayers.find(
          (p) => p.id === playerId
        );
        if (player) {
          const playerName = player.name
          socket.emit("sessionValidation", { isValid, roomData, playerName });
          setTimeout(() => {
            io.to(sessionId).emit("roomData", roomData);
          }, 5000);
        } else {
          socket.emit("sessionValidation", { isValid: false });
        }
      } else {
        socket.emit("sessionValidation", { isValid: false });
      }
    });

    socket.on("getRoomData", ({ roomId }) => {
      const roomData = rooms.get(roomId);
      if (roomData) {
        socket.emit("roomData", roomData);
        // console.log(`This room data qui envois au front ${roomId}`,roomData)
      }
    });

    socket.on("reconnect", () => {
      console.log("User reconnected : ", socket.id);
      for (let [roomId, roomData] of rooms.entries()) {
        const playerIndex = roomData.disconnectedPlayers.findIndex(
          (p) => p.id === playerId
        );
        const { id, playerName } = roomData.disconnectedPlayers[playerIndex];
        if (playerIndex !== -1) {
          console.log("Reconnected player ", playerId);
          // socket.emit("reconnect", {roomId})
          socket.join(roomId);
          io.to(roomId).emit("roomData", roomData);
          roomData.players.push({
            id: id,
            name: playerName,
            isHost: false,
          });
          roomData.disconnectedPlayers.splice(playerIndex, 1);
          console.log("DDDDDDDDDDDDDDD");
          if (roomData.players.length >= 2) {
            roomData.status = "running";
          }
        }
      }
    });
    socket.on("createRoom", ({ roomName, playerName, playerId }) => {
      if (rooms.has(roomName)) {
        socket.emit("roomError", { message: "Room already exists" });
        return;
      }

      if (rooms.has(playerId)) {
        socket.emit("roomError", { message: "You already have room running" });
        return;
      }
      sessionId = uuidv7();
      const roomData = {
        id: roomName,
        sessionId: sessionId,
        players: [
          {
            id: playerId,
            name: playerName,
            isHost: true,
          },
        ],
        disconnectedPlayers: [],
        ready: [],
        status: "waiting",
      };

      rooms.set(roomName, roomData);
      socket.join(roomName);

      io.to(roomName).emit("roomCreated", {
        roomId: roomName,
        playerId: playerId,
        playerName: playerName,
        sessionId: sessionId,
      });
      io.to(roomName).emit("roomData", roomData);
      console.log("Room created");
    });

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
      console.log("le joueur qui en join le room ", playerId);
      const playerIndex = roomData.disconnectedPlayers.findIndex(
        (p) => p.id === playerId
      );
      if (playerIndex !== -1) {
        console.log("le joueur qui en join le room ", playerId);
        const { id, name, isHost } = roomData.disconnectedPlayers[playerIndex];
        roomData.players.push({
          id: id,
          name: name,
          isHost: isHost,
        });
        roomData.disconnectedPlayers.splice(playerIndex, 1);
        // roomData.status = "running";
      } else {
        const newPlayer = {
          id: playerId,
          name: playerName,
          isHost: false,
        };
        console.log("Adding new player", newPlayer);
        roomData.players.push(newPlayer);
      }
      socket.join(roomName);

      // Enhanced playerJoined event with complete player information
      io.to(roomName).emit("playerJoined", {
        sessionId: sessionId,
        roomId: roomName,
        playerId: playerId,
        playerName: playerName,
        players: roomData.players,
      });

      io.to(roomName).emit("roomData", roomData);
      console.log("WSSLTTTT");
    });

    socket.on("playerReady", ({ playerId, roomId }) => {
      console.log("Received for ready:", { playerId, roomId });
      let room = rooms.get(roomId);
      //Cherck if room is already exist
      if (room) {
        // Add player to the ready array if not already in it
        console.log("Room is valid for ready");
        if (!room.ready.includes(playerId)) {
          room.ready.push(playerId);
        }
        if (room.ready.length >= 2) {
          room.status = "running";
        }
        // Emit the updated room data to all players in the room
        io.to(roomId).emit("roomData", room); // Emit updated room data
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

    socket.on("completeRace", (roomId) => {
      io.to(roomId).emit("raceCompleted", {
        winnerId: playerId,
      });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${playerId}`);
      // Enhanced disconnect handling with player name
      //console.log("ROOM", Array.from(rooms.entries()));
      for (let [roomId, roomData] of rooms.entries()) {
        // console.log(`Checking room: ${roomId}`);
        //console.log("Room Players:", roomData.players);
        const playerIndex = roomData.players.findIndex(
          (p) => p.id === playerId
        );
        roomData.players.forEach((player) => {
          console.log(
            `Comparing playerId: ${playerId} with player.id: ${player.id}`
          );
        });

        if (playerIndex !== -1) {
          const disconnectedPlayer = roomData.players[playerIndex];
          const wasHost = disconnectedPlayer.isHost;
          const disconnectedPlayerName = disconnectedPlayer.name;
          const disconnectedPlayerId = disconnectedPlayer.id;
          console.log("Removing player");
          // Remove the player from the room
          roomData.players.splice(playerIndex, 1);
          if (roomData.players.length === 0) {
            rooms.delete(roomId);
          }
          roomData.disconnectedPlayers.push({
            id: disconnectedPlayerId,
            name: disconnectedPlayerName,
            isHost: false,
          });
          roomData.status = "waiting";
          // Reassign host if necessary
          if (wasHost && roomData.players.length > 0) {
            roomData.players[0].isHost = true;
          }

          if (roomData.players.length === 0) {
            // Delay room deletion to handle reconnection
            setTimeout(() => {
              rooms.delete(roomId);
              io.to(roomId).emit("roomDeleted");
            }, 10000); // 10 seconds buffer before deleting the room
          } else {
            io.to(roomId).emit("roomData", roomData);
          }

          // Enhanced disconnect notification with player name
          io.to(roomId).emit("playerDisconnected", {
            playerId,
            playerName: disconnectedPlayerName,
            remainingPlayers: roomData.players,
          });

          break;
        }
      }
    });

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
