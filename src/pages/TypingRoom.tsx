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
import SecondTimerDisplay from "../components/SecondTimerDisplay";
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
  text: string;
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

  // const {
  //   toggleStart,
  //   toggleReset,
  //   toggleStop,
  //   Counter,
  //   isRunning,
  // } = useCounter(10);
  // const timer = useCounter(60);

  // useEffect(() => {
  //   // Start the second timer when the first Counter reaches 0
  //   if (Counter === 0 ) {
  //     timer.toggleStart();
  //   }
  // }, [Counter, timer]);

  // useEffect(() => {
  //   if (RoomData?.text) {
  //     const words = RoomData.text.split(" ").length;
  //     const timerDuration = Math.ceil((words / 40) * 60); // Assuming 40 WPM average speed
  //     setTimer(useCounter(timerDuration)); // Dynamically set the timer based on text length
  //   }
  // }, [RoomData?.text]);


  const {
    toggleStart: startPreparationTimer,
    toggleReset: resetPreparationTimer,
    Counter: preparationTime,
    isRunning: isPreparationRunning,
  } = useCounter(10); 

  // Main typing timer
  const {
    toggleStart: startTypingTimer,
    toggleReset: resetTypingTimer,
    Counter: typingTime,
    setCounter: setTypingDuration, 
  } = useCounter(); // Default to 60 seconds

  // Handle starting the typing timer when the preparation timer reaches 0
  useEffect(() => {
    if (preparationTime === 0 && !isPreparationRunning) {
      startTypingTimer();
    }
  }, [preparationTime, isPreparationRunning, startTypingTimer]);

  // Dynamically set the typing timer duration based on text length
  useEffect(() => {
    if (RoomData?.text) {
      const chars = RoomData.text.length;
      const timerDuration = Math.ceil((chars / 5) / 40 * 60); 
      setTypingDuration(timerDuration); // Set the main typing timer duration
    }
  }, [RoomData?.text, setTypingDuration]);



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
      RoomData?.players.length! >= 2 &&
      RoomData?.ready.length! >= 2 &&
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
    RoomData?.players.length, // Only depend on the length
    RoomData?.ready.length,   // Only depend on ready length
    RoomData?.status ,  
    RoomData?.text]);

  if (!RoomData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/bg.jpg')] bg-cover bg-center">
        <div className="text-white text-2xl">Loading room data...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center `}>
      
      <Card className={`w-full h-screen bg-purple-400 px-7 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border-none`}>
        {opponentStats && <OpponentStats {...opponentStats} />}
        <CardHeader>
          <CardTitle className="text-white text-5xl text-center">
            Room: {roomId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-white">
              <SecondTimerDisplay counter={typingTime} status={RoomData?.status} />
              <TimerDisplay counter={preparationTime} status={RoomData?.status} />
              <h2 className="text-4xl font-semibold mb-2 text-center">Status : {RoomData.status.toUpperCase()}</h2>
              <h3 className="text-4xl font-semibold mb-2 text-center">Players:</h3>
              <div className="flex items-center justify-center gap-8">
                {RoomData.players.map((player, index) => (
                  <>
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
                   {index === 0 &&  RoomData.players.length > 1 && (
                  <div className="text-4xl font-bold">VS</div>
                )}
                </>
                ))}
              </div>
            </div>
          </div>
          {RoomData.ready.length >= 2 ? (
            <TypingCmp socket={socket} roomId={roomId!} playerId={playerId!} counter={preparationTime} sampleText={RoomData.text} timer={typingTime}/>
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
