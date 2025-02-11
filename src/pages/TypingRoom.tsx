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
// import {IP} from "./ip";
import React from "react";

const socket = io(`wss://typing-battle.onrender.com/`, {
  transports: ["websocket"],
});

// if you using the website locally then comment the above code and uncomment bellow

// const socket = io(`ws://${IP}:4000`, {
//   transports: ["websocket"],
// });

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface RoomData {
  id: string;
  text: string;
  players: Player[];
  status: string;
  ready: string[];
}

export default function TypingRoom() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [RoomData, setRoomData] = useState<RoomData | null>(null);
  const [opponentStats, setOpponentStats] = useState<{
    playerName: string;
    wpm: number;
    accuracy: number;
    errors: number;
  } | null>(null);



  const {
    toggleStart: startPreparationTimer,
    Counter: preparationTime,
  } = useCounter(5);

  
  // const {
  //   toggleStart: startTypingTimer,
  //   toggleReset: resetTypingTimer,
  //   Counter: typingTime,
  //   setCounter: setTypingDuration, 
  // } = useCounter(5); 

  
  // useEffect(() => {
  //   if (preparationTime === 0 && !isPreparationRunning) {
  //     startTypingTimer();
  //   }
  // }, [preparationTime, isPreparationRunning, startTypingTimer]);

  
  // useEffect(() => {
  //   if (RoomData?.text) {
  //     const chars = RoomData.text.length;
  //     const timerDuration = Math.ceil((chars / 5) / 40 * 60); 
  //     setTypingDuration(timerDuration); 
  //   }
  // }, [RoomData?.text, setTypingDuration]);



  const searchParams = useSearchParams();

   const handleReady = () => {
    socket.emit("playerReady", { playerId, roomId });
   
  };
  const textOptions = [
    "The quick brown fox jumps over the lazy dog. Programming is the art of telling another human what one wants the computer to do.",
    "In the world of coding, every semicolon matters. A single character can make the difference between a working program and a syntax error that keeps you debugging for hours.",
    "Technology has revolutionized the way we live, work, and connect with others. As we continue to innovate, the possibilities seem endless in this digital age.",
    "Software development is like building a house. You need a solid foundation, careful planning, and attention to detail. Testing ensures your structure won't collapse.",
    "The best code is not just functional but also readable and maintainable. Clean code reads like well-written prose and tells a story about its purpose.",
    "Artificial intelligence and machine learning are transforming industries across the globe. The future holds endless possibilities for those who embrace these technologies.",
    "Great developers write code that humans can understand. Documentation is not just helpful; it's essential for maintaining and scaling software projects effectively.",
    "Version control is like a time machine for your code. Git allows developers to experiment freely, knowing they can always return to a working state if needed.",
    "The internet is a vast network connecting billions of devices worldwide. Every click, every search, and every message travels through this intricate web of connections.",
    "Security in software development is not an afterthought but a fundamental requirement. Every line of code must be written with potential vulnerabilities in mind."
  ];
  
  const sampleText = textOptions[Math.floor(Math.random() * textOptions.length)];

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

    socket.emit("setPlayerId" , playerId);

    if (!roomId || !playerId || !playerName) {
      console.error("Missing required parameters");
      return;
    }
    console.log("room:", RoomData);
     
      socket.emit("getRoomData", { roomId });
  

    socket.on("roomData", (data) => {
      console.log("Received room data:", data);

      if (!data) {
        console.log("Creating new room:", roomId);
        socket.emit("createRoom", { roomName: roomId, playerName, playerId, text: sampleText });
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
        text: data.text,
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
      (RoomData?.players.length ?? 0) >= 2 &&
      (RoomData?.ready.length ?? 0) >= 2 &&
      RoomData?.status === "running"
    ) {
      setTimeout(() => {
        startPreparationTimer();
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
      socket.off("playerReady");

    };

  },  [searchParams, playerId, playerName,
    RoomData?.players.length, 
    RoomData?.ready.length,   
    RoomData?.status ,  
    RoomData?.text]);

    useEffect(()=>{
      if(RoomData?.status === "running"){
        startPreparationTimer();
      }
    },[RoomData?.status,socket ]);

  if (!RoomData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/bg.jpg')] bg-cover bg-center">
        <div className="text-white text-2xl">🎮 Loading room data... ⌛</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center ">
      <Card className={`w-full h-screen bg-purple-400 px-7 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border-none`}>
        {opponentStats && <OpponentStats {...opponentStats} />}
        
        <CardHeader className="space-y-8">
        <CardTitle className="text-white text-6xl text-center font-bold tracking-wide bg-clip-text">
           Room: {roomId} 
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-12">
          <div className="text-white">
            <TimerDisplay counter={preparationTime} status={RoomData?.status} />
            
            <div className="text-center space-y-8 mb-12">
            <h2 className="text-4xl font-bold text-white bg-clip-text">
               {RoomData.status === 'waiting' && '⏳'}
                {RoomData.status === 'running' && '🏃'}
                {RoomData.status.toUpperCase()}
              </h2>
              
              <h3 className="text-4xl font-bold text-white bg-clip-text">
                👥 Players 👥
              </h3>
            </div>

            <div className="flex items-center justify-center gap-8 mb-12">
              {RoomData.players.map((player, index) => (
                <React.Fragment key={player.id}>
                  <div className={`p-6 rounded-xl w-72 backdrop-blur-lg transform transition-all duration-300 
                    ${player.id === playerId 
                      ? "bg-white/10 border-2 border-green-400/20" 
                      : "bg-white/10 border-2 border-white/20"}`}>
                    <div className="font-bold flex justify-between items-center text-2xl">
                    <span className="truncate">
                        {player.id === playerId ? '🎮 ' : '🕹️ '}
                        {player.name}
                      </span>
                      {player.isHost && (
                        <span className="text-amber-300 text-sm font-normal">👑Host</span>
                      )}
                      <span>
                        {RoomData.ready.includes(player.id) ? (
                          <BadgeCheck className="w-8 h-8 text-green-400 animate-pulse" />
                        ) : (
                          player.id === playerId && (
                            <Button 
                              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold transform transition-all duration-300 hover:scale-105 shadow-lg"
                              onClick={handleReady}
                            >
                              Ready
                            </Button>
                          )
                        )}
                      </span>
                    </div>
                  </div>
                  {index === 0 && RoomData.players.length > 1 && (
                    <div className="text-5xl font-bold bg-gradient-to-r from-white to-white text-transparent bg-clip-text animate-pulse">
                      VS
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {RoomData.ready.length >= 2 ? (
            <div className="transform transition-all duration-500 hover:scale-[1.02]">
              <TypingCmp
                socket={socket}
                roomId={roomId!}
                playerId={playerId!}
                counter={preparationTime}
                sampleText={RoomData.text}
              />
            </div>
          ) : (
            <div className="flex mt-16 items-center justify-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-300 to-red-400 text-transparent bg-clip-text animate-pulse">
                Waiting for players to ready... {RoomData.ready.length}/2
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

