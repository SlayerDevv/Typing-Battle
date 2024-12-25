"use client";

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid'; // For generating playerId on client-side if needed

const socket = io('http://localhost:4000', {
 
  transports: ['websocket'],
});

export default function RoomsPage() {
  const [playerId, setPlayerId] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]); // For logs/messages
  const [isRoomFull, setIsRoomFull] = useState(false);

  useEffect(() => {
    // Listen for events from the server
    socket.on('roomJoined', ({ roomId, playerId }) => {
      setPlayerId(playerId);
      setCurrentRoom(roomId);
      setMessages((prev) => [...prev, `Joined room ${roomId} as player ${playerId}`]);
      setIsRoomFull(false);
    });

    socket.on('roomFull', ({ message }) => {
      setMessages((prev) => [...prev, message]);
      setIsRoomFull(true);
    });

    socket.on('playerJoined', ({ playerId }) => {
      setMessages((prev) => [...prev, `Player ${playerId} joined the room`]);
    });

    socket.on('playerDisconnected', ({ playerId }) => {
      setMessages((prev) => [...prev, `Player ${playerId} disconnected`]);
    });

    return () => {
      socket.off('roomJoined');
      socket.off('roomFull');
      socket.off('playerJoined');
      socket.off('playerDisconnected');
    };
  }, []);

  const joinRoom = (roomId) => {
    if (currentRoom === roomId) {
      setMessages((prev) => [...prev, `Already in room ${roomId}`]);
      return;
    }
    socket.emit('joinRoom', roomId);
    setCurrentRoom(roomId);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6">Choose a Room</h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <button
          className="px-8 py-4 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700"
          onClick={() => joinRoom('room1')}
          disabled={isRoomFull}
        >
          Join Room 1
        </button>
        <button
          className="px-8 py-4 bg-green-500 text-white rounded-lg shadow hover:bg-green-700"
          onClick={() => joinRoom('room2')}
          disabled={isRoomFull}
        >
          Join Room 2
        </button>
      </div>

      <div className="w-3/4 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Messages</h2>
        <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded border">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <p key={index} className="text-sm text-gray-800">
                {msg}
              </p>
            ))
          ) : (
            <p className="text-gray-500">No messages yet...</p>
          )}
        </div>
      </div>

      {currentRoom && (
        <p className="text-lg mt-4 text-gray-700">
          You are in <span className="font-bold">{currentRoom}</span> as{' '}
          <span className="font-bold">{playerId}</span>.
        </p>
      )}
    </div>
  );
}
