'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { io } from 'socket.io-client'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import '../app/globals.css'

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
  
  const roomId = searchParams?.get('roomId')
  const playerId = searchParams?.get('playerId')
  const playerName = searchParams?.get('playerName')

  useEffect(() => {
    if (!roomId || !playerId || !playerName) {
      console.error('Missing required parameters')
      return
    }

    socket.on('playerJoined', ({ roomId: updatedRoomId, players }) => {
      if (updatedRoomId === roomId) {
        setRoomData(prev => ({
          ...prev!,
          players: players
        }))
      }
    })

    // Request initial room data
    socket.emit('getRoomData', { roomId })

    socket.on('roomData', (data) => {
      setRoomData(data)
    })

    return () => {
      socket.off('playerJoined')
      socket.off('roomData')
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
                      <p className="font-bold text-2xl text-center">{player.name} {player.isHost ? '(Host)' : ''}</p>
                    </div>
                    {index === 0 && roomData.players.length > 1 && (
                      <div className="text-4xl font-bold">VS</div>
                    )}
                  </>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
