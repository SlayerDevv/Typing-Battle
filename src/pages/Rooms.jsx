"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Profile from "@/components/Profile";
import { ClerkProvider } from "@clerk/nextjs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { handleCreateRoomAction, handleJoinRoomAction } from "@/lib/actions";
import { createRoomSchema, joinRoomSchema } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import {IP} from "../config/ip";

let socket; 

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

export default function RoomsPage() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState("");
  const [playerDisplayName, setPlayerDisplayName] = useState(""); // For player display name input
  const [roomName, setRoomName] = useState(""); // For room name input
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ensure playerId is available before socket connection
    let playerId = localStorage.getItem("playerId");
    if (!playerId) {
      playerId ??= uuidv4();
      localStorage.setItem("playerId", playerId);
    }
    setPlayerId(playerId);

    // Initialize the socket connection after playerId is ready
    socket = io(`wss://typing-battle.onrender.com/`, {
      transports: ["websocket"],
      query: { playerId }, // Send playerId during initial connection
    });

    // if you using the website locally then comment the above code and uncomment bellow

    // const socket = io(`ws://${IP}:4000`, {
    //   transports: ["websocket"],
    // });

    
    socket.on("connect", () => {
      console.log(`Connected with playerId: ${playerId}`);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("Failed to connect to server.");
    });

    socket.emit("setPlayerId" , playerId);


    socket.on("roomCreated", ({ roomId, playerId, playerName }) => {
      console.log(`roomCreated: playerId from server: ${playerId}`);
      localStorage.setItem("roomId", roomId);
      router.push(
        `/TypingRoom?roomId=${roomId}&playerId=${playerId}&playerName=${playerName}`
      );
    });

    socket.on("playerJoined", ({ roomId, playerId, playerName }) => {
      console.log(`playerJoined: playerId from server: ${playerId}`);
      localStorage.setItem("roomId", roomId);
      router.push(
        `/TypingRoom?roomId=${roomId}&playerId=${playerId}&playerName=${playerName}`
      );
    });

    socket.on("roomError", ({ message }) => {
      setError({ error: { details: [{ message }] }, type: "JOIN" });
    });

    return () => {
      socket.off("roomJoined");
      socket.off("roomFull");
      socket.off("playerJoined");
      socket.off("roomCreated");
      socket.off("playerJoined");
      socket.off("roomError");
      socket.off("connect");
    };
  }, [router]);


  const handleCreateRoom = async () => {
    const validationResult = await handleCreateRoomAction({
      createRoomSchema,
      playerDisplayName,
      RoomName: roomName,
    });

    if (validationResult.error) {
      setError(validationResult);
    } else {
      const { playerName, roomName: validatedRoomName } = validationResult.data;
      console.log("Room created", validationResult.data);
      socket.emit("createRoom", {
        roomName: validatedRoomName,
        text: sampleText,
        playerName,
        playerId,
      });

      localStorage.setItem("roomName", validatedRoomName);
    }
  };

  const handleJoinRoom = async () => {
    const validationResult = await handleJoinRoomAction({
      joinRoomSchema,
      playerDisplayName,
      RoomId: roomName,
    });

    if (validationResult.error) {
      setError(validationResult);
    } else {
      const { playerName, roomName: validatedRoomName } = validationResult.data;
      socket.emit("joinRoom", {
        roomName: validatedRoomName,
        playerName,
        playerId,
      });
      localStorage.setItem("roomName", validatedRoomName);
    }
  };

  return (
    <ClerkProvider>
    <div className='flex-col  gap-16 min-h-screen flex items-center justify-center relative bg-slate-900'>
        
       
       <div className="absolute inset-0 backdrop-blur-5xl">
       <div className="absolute inset-0 bg-[url('/bg.jpg')]  bg-cover bg-center opacity-20" />
       
       </div>
      <div className="grid sm:grid-cols-1 md:grid-cols-3 max-sm:grid-cols-1 grid-cols-3 grid-flow-row gap-16">
        {/* Create Room Card */}
        <Profile />
        <Card className="px-6 bg-black/20 backdrop-blur-xl rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 border-0">
          <CardHeader>
            <CardTitle className="text-white text-xl">Create Room</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto p-0">
            <div className="space-y-[14px]">
              {error?.type === "CREATE" && error?.error.details[0].message ? (
                <Alert className="bg-red-900 rounded-md bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-40 border border-gray-100 text-red-400">
                  <AlertTitle>Oopsie!!</AlertTitle>
                  <AlertDescription>
                    {error?.error.details[0].message}
                  </AlertDescription>
                </Alert>
              ) : (
                ""
              )}
              <Input
                placeholder="Player displayname"
                className="bg-yellow-400/5 text-white placeholder:text-yellow-200/50 border-0 focus:ring-1 focus:ring-yellow-400/30"
                onChange={(e) => {
                  setPlayerDisplayName(e.target.value), setError(null);
                }}
              />
              <Input
                placeholder="Room name"
                className="bg-yellow-400/5 text-white placeholder:text-yellow-200/50 border-0 focus:ring-1 focus:ring-yellow-400/30"
                onChange={(e) => {
                  setRoomName(e.target.value), setError(null);
                }}
              />
              <Button
                className="w-full group flex items-center justify-center gap-2 bg-yellow-400/5 hover:bg-yellow-400/10 text-yellow-400 rounded-xl transition-all duration-200 border-0"
                onClick={handleCreateRoom}
              >
                Create Room
              </Button>
            </div>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>

        {/* Join Room Card */}
        <Card className="px-6 bg-black/20 backdrop-blur-xl rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 border-0">
          <CardHeader>
            <CardTitle className="text-white text-xl">Join Room</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto p-0">
            <div className="space-y-[14px]">
              {error?.type === "JOIN" && error?.error.details[0].message ? (
                <Alert className="bg-red-900 rounded-md bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-40 border border-gray-100 text-red-400">
                  <AlertTitle>Oopsie!!</AlertTitle>
                  <AlertDescription>
                    {error?.error.details[0].message}
                  </AlertDescription>
                </Alert>
              ) : (
                ""
              )}
              <Input
                placeholder="Player displayname"
                className="bg-yellow-400/5 text-white placeholder:text-yellow-200/50 border-0 focus:ring-1 focus:ring-yellow-400/30"
                onChange={(e) => {
                  setPlayerDisplayName(e.target.value), setError(null);
                }}
              />
              <Input
                placeholder="Room ID / Room name"
                className="bg-yellow-400/5 text-white placeholder:text-yellow-200/50 border-0 focus:ring-1 focus:ring-yellow-400/30"
                onChange={(e) => {
                  setRoomName(e.target.value), setError(null);
                }}
              />
              <Button
                className="w-full group flex items-center justify-center gap-2 bg-yellow-400/5 hover:bg-yellow-400/10 text-yellow-400 rounded-xl transition-all duration-200 border-0"
                onClick={handleJoinRoom}
              >
                Join Room
              </Button>
            </div>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>

      
       <div className="flex flex-col md:flex-row gap-14 w-full max-w-xl">
        
      <Link href="/IndividualRoom" className="w-full">
        <Button className="w-full bg-gradient-to-br from-cyan-400 to-teal-500 hover:from-cyan-500 hover:to-teal-600 text-white text-xl py-8 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-cyan-200/30 group">
          <span className="flex items-center justify-center gap-4 font-semibold">
            <span className="text-3xl group-hover:animate-bounce">🎮</span>
            Play Alone
            <span className="text-3xl group-hover:animate-bounce">🚀</span>
          </span>
        </Button>
      </Link>
      
      <Link href="/Leaderboard" className="w-full">
        <Button className="w-full bg-gradient-to-br from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white text-xl py-8 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-pink-200/30 group">
          <span className="flex items-center justify-center gap-4 font-semibold">
            <span className="text-3xl group-hover:animate-bounce">🏆</span>
            Leaderboard
            <span className="text-3xl group-hover:animate-bounce">👑</span>
          </span>
        </Button>
      </Link>
    </div>
      
    </div>
    </ClerkProvider>

  );
}
