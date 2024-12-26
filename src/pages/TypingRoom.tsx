'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { io } from 'socket.io-client'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { BadgeCheck } from 'lucide-react'
import '../app/globals.css'
import TypingCmp from '../components/TypingCmp'
import OpponentStats from '../components/OpponentStats'
const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

interface Player {
  id: string
  name: string
  isHost: boolean
}

interface RoomData {
  id: string
  players: Player[]
  status: string
}

export default function TypingRoom() {
  const searchParams = useSearchParams()
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [isReady, setIsReady] = useState<Boolean>(false);
  const [opponentStats, setOpponentStats] = useState<{
    playerName: string;
    wpm: number;
    accuracy: number;
    errors: number;
  } | null>(null);
  
  const roomId = searchParams?.get('roomId')
  const playerId = searchParams?.get('playerId')
  const playerName = searchParams?.get('playerName')

  useEffect(() => {
    if (!roomId || !playerId || !playerName) {
      console.error('Missing required parameters')
      return
    }

    // First check if room exists
    socket.emit('getRoomData', { roomId });

    socket.on('roomData', (data) => {
      console.log('Received room data:', data);
      if (!data) {
        // Room doesn't exist, create it
        console.log('Creating new room:', roomId);
        socket.emit('createRoom', { roomName: roomId, playerName, playerId });
      } else if (!data.players.find((p: Player) => p.id === playerId)) {
        // Room exists and player is not in it, try to join
        console.log('Joining existing room:', roomId);
        socket.emit('joinRoom', { roomName: roomId, playerName, playerId });
      }
      setRoomData(data);
    });

    socket.on('roomCreated', (data) => {
      console.log('Room created:', data);
      setRoomData({
        id: data.roomId,
        players: [{
          id: data.playerId,
          name: data.playerName,
          isHost: true
        }],
        status: 'waiting'
      });
    });

    socket.on('playerJoined', ({ roomId: updatedRoomId, players }) => {
      console.log('Player joined:', players);
      if (updatedRoomId === roomId) {
        setRoomData(prev => ({
          ...prev!,
          players: players
        }))
      }
    });
    socket.on("playerReady", ({playerId: playerId, roomName: roomId}) => {
      if (isReady){
        
      }
    })

    // Add listener for stats updates
    socket.on('playerStats', ({ playerId: statsPlayerId, playerName: statsPlayerName, stats }) => {
      if (statsPlayerId !== playerId) {  // Only update if it's the opponent's stats
        setOpponentStats({
          playerName: statsPlayerName,
          ...stats
        });
      }
    });

    // Add to your useEffect socket listeners
    socket.on('playerDisconnected', ({ playerId: disconnectedPlayerId }) => {
      setRoomData(prev => {
        if (!prev) return null;
        
        // If the disconnected player was the host, make the first remaining player the host
        const remainingPlayers = prev.players.filter(p => p.id !== disconnectedPlayerId);
        if (remainingPlayers.length > 0 && prev.players.find(p => p.id === disconnectedPlayerId)?.isHost) {
          remainingPlayers[0].isHost = true;
        }

        return {
          ...prev,
          players: remainingPlayers
        };
      });

      // Alert if opponent disconnected
      if (playerId !== disconnectedPlayerId) {
        alert('Your opponent has disconnected!');
      }
    });

    return () => {
      socket.off('playerJoined');
      socket.off('roomData');
      socket.off('roomCreated');
      socket.off('playerStats');
      socket.off('playerDisconnected');
    }
  }, [roomId, playerId, playerName])

  if (!roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/bg.jpg')] bg-cover bg-center">
        <div className="text-white text-2xl">Loading room data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen  bg-[url('/bg.jpg')] bg-cover bg-center">
      <Card className="w-full h-screen bg-purple-400 px-7 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border-none">
        {opponentStats && <OpponentStats {...opponentStats} />}
        <CardHeader>
          <CardTitle className="text-white text-5xl text-center">Room: {roomId}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-white">
              <h3 className="text-4xl font-semibold mb-2 text-center">Players:</h3>
              <div className="flex items-center justify-center gap-8">
                {roomData.players.map((player, index) => (
                  <>
                    <div 
                      key={player.id}
                      className={`p-3 rounded-md w-64 ${
                        player.id === playerId 
                          ? 'bg-green-500 bg-opacity-20' 
                          : 'bg-purple-500 bg-opacity-20'
                      }`}
                    >
                      <p className="font-bold flex justify-between pl-5 items-center text-2xl text-center">{player.name} {player.isHost ? '(Host)' : ''} <span>{}</span></p>
                    </div>
                    {index === 0 && roomData.players.length > 1 && (
                      <div className="text-4xl font-bold">VS</div>
                    )}
                  </>
                ))}
              </div>
            </div>
          </div>
          <TypingCmp 
            socket={socket} 
            roomId={roomId!} 
            playerId={playerId!} 
          />
        </CardContent>
      </Card>
     
    </div>
  )
}
