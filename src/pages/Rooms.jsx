"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast"; 
import { useToast } from "@/hooks/use-toast";


const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isRoomFull, setIsRoomFull] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
    const fetchRooms = async () => {
      const response = await fetch("/rooms.json");
      const data = await response.json();
      setRooms(data);
    };

    fetchRooms();

    socket.on("roomJoined", ({ roomId }) => {
      setCurrentRoom(roomId);
      setIsRoomFull(false);
      showToast(`Joined room ${roomId}`, "success");
    });

    socket.on("roomFull", ({ message, roomId }) => {
      if (currentRoom !== roomId) {
        setIsRoomFull(true); // Only set room full if it's not the current room
        showToast(message, "error");
      }
    });

    socket.on("playerJoined", ({ playerId }) => {
      showToast(`Player ${playerId} joined the room`, "info");
    });

    socket.on("playerDisconnected", ({ playerId }) => {
      showToast(`Player ${playerId} disconnected`, "warning");
    });

    return () => {
      socket.off("roomJoined");
      socket.off("roomFull");
      socket.off("playerJoined");
      socket.off("playerDisconnected");
    };
  }, [currentRoom]); // Add currentRoom as a dependency to prevent unnecessary re-renders

  const showToast = (message, type) => {
    toast({
      title: message,
      description: type === "success" ? "success!" : null,
      variant: type,
    });
  };

  const joinRoom = (roomId) => {
    if (currentRoom === roomId) {
      showToast(`Already in room ${roomId}`, "info");
      return;
    }

    // Check if room is full
    if (isRoomFull && currentRoom !== roomId) {
      showToast("This room is full, try another one.", "error");
      return;
    }

    socket.emit("joinRoom", roomId);
   
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
        <h1 className="text-3xl font-bold mb-6">Choose a Room</h1>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {rooms.map((room) => (
            <button
              key={room.id}
              className="px-8 py-4 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700"
              onClick={() => joinRoom(room.id)}
              disabled={isRoomFull && currentRoom !== room.id} 
            >
              {room.name}
            </button>
          ))}
        </div>

        {currentRoom && (
          <p className="text-lg mt-4 text-gray-700">
            You are in <span className="font-bold">{currentRoom}</span>.
          </p>
        )}

        <ToastViewport />
      </div>
    </ToastProvider>
  );
}
