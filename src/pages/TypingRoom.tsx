"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "@/components/ui/button";
import { useCounter } from "@/hooks/useCounter";
import { BadgeCheck } from "lucide-react";
import "../app/globals.css";
import TypingCmp from "../components/TypingCmp";
import TimerDisplay from "../components/TimerDisplay";
import OpponentStats from "../components/OpponentStats";

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface RoomData {
  id: string;
  players: Player[];
  status: string;
  ready: String[];
}

export default function TypingRoom() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [RoomData, setRoomData] = useState<RoomData | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [opponentStats, setOpponentStats] = useState<{
    playerName: string;
    wpm: number;
    accuracy: number;
    errors: number;
  } | null>(null);

  const {
    toggleStart,
    toggleReset,
    toggleStop,
    Counter,
    isRunning,
  } = useCounter(10);

  const searchParams = useSearchParams();

   const handleReady = () => {
    socket.emit("playerReady", { playerId, roomId });
   
  };

  useEffect(() => {
    const roomId = localStorage.getItem("roomId");
    const playerId = localStorage.getItem("playerId");
    const playerName = searchParams?.get("playerName");

    if (roomId && playerId && playerName) {
      setRoomId(roomId);
      setPlayerId(playerId);
      setPlayerName(playerName);

      console.log("player id: ", playerId);
      console.log("player name: ", playerName);
    }

    if (!roomId || !playerId || !playerName) {
      console.error("Missing required parameters");
      return;
    }

    socket.emit("getRoomData", { roomId });

    socket.on("roomData", (data) => {
      console.log("Received room data:", data);

      if (!data) {
        console.log("Creating new room:", roomId);
        socket.emit("createRoom", { roomName: roomId, playerName, playerId });
      } else if (!data.players.find((p: Player) => p.id === playerId)) {
        console.log("Joining existing room:", roomId);
        socket.emit("joinRoom", { roomName: roomId, playerName, playerId });
      }

      setRoomData(data);
    });

    socket.on("roomCreated", (data) => {
      console.log("Room created:", data);
      setRoomData({
        id: data.roomId,
        players: [
          {
            id: data.playerId,
            name: data.playerName,
            isHost: true,
          },
        ],
        ready: [],
        status: "waiting",
      });
      localStorage.setItem("roomId", data.roomId);
    });

    socket.on("playerJoined", ({ roomId: updatedRoomId, players }) => {
      console.log("Player joined:", players);
      if (updatedRoomId === roomId) {
        setRoomData((prev) => ({
          ...prev!,
          players: players,
        }));
      }
      localStorage.setItem("roomId", updatedRoomId);
    });

    if (
      RoomData?.players.length! >= 2 &&
      RoomData?.ready.length! >= 2 &&
      RoomData?.status == "running"
    ) {
      setTimeout(() => {
        toggleStart();
      }, 2000);
    }

    socket.on("playerStats", ({ playerId: statsPlayerId, playerName: statsPlayerName, stats }) => {
      if (statsPlayerId !== playerId) {
        setOpponentStats({
          playerName: statsPlayerName,
          ...stats,
        });
      }
    });

    return () => {
      socket.off("playerJoined");
      socket.off("roomData");
      socket.off("roomCreated");
      socket.off("playerStats");
      socket.off("playerDisconnected");
      socket.off("playerReady");
      socket.off("reconnect");
    };
  }, [searchParams, playerId, playerName]);

 

  useEffect(() => {
    console.log("Updated RoomData:", RoomData);
  }, [RoomData]);

  if (!RoomData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/bg.jpg')] bg-cover bg-center">
        <div className="text-white text-2xl">Loading room data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center">
      <Card className="w-full h-screen bg-purple-400 px-7 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border-none">
        {opponentStats && <OpponentStats {...opponentStats} />}
        <CardHeader>
          <CardTitle className="text-white text-5xl text-center">
            Room: {roomId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-white">
              <TimerDisplay counter={Counter} status={RoomData?.status} />
              <h2 className="text-4xl font-semibold mb-2 text-center">Status : {RoomData.status}</h2>
              <h3 className="text-4xl font-semibold mb-2 text-center">Players:</h3>
              <div className="flex items-center justify-center gap-8">
                {RoomData.players.map((player, index) => (
                  <div key={player.id} className={`p-3 rounded-md w-64 ${player.id === playerId ? "bg-green-500 bg-opacity-20" : "bg-purple-500 bg-opacity-20"}`}>
                    <p className="font-bold flex justify-between items-center text-2xl text-center">
                      {player.name}
                      {player.isHost ? "(Host)" : ""}
                      <span>
                        {RoomData.ready.includes(player.id) ? (
                          <BadgeCheck color="#54B435" />
                        ) : (
                          player.id === playerId && <Button className="bg-yellow-400" onClick={handleReady}>Ready</Button>
                        )}
                      </span>
                    </p>
                  </div>
                ))}
                {RoomData.players.length > 1 && (
                  <div className="text-4xl font-bold">VS</div>
                )}
              </div>
            </div>
          </div>
          {RoomData.ready.length >= 2 ? (
            <TypingCmp socket={socket} roomId={roomId!} playerId={playerId!} />
          ) : (
            <div className="flex mt-[50px] items-center justify-center">
              <div className="text-white text-2xl">
                Waiting for players to ready .. {RoomData.ready.length}/2
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
