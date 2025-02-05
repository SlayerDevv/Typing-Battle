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
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { handleCreateRoomAction, handleJoinRoomAction } from "@/lib/actions";
import { createRoomSchema, joinRoomSchema } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import {IP} from "./ip";

let socket; 

const textOptions = [
  "The quicr to do.",
  "In the woking program and a syntax error that keeps you debugging for hours.",
  "Technology has revte, the possibilities seem endless in this digital age.",
  "Software developmentructure won't collapse.",
  "The best code is not just functiwell-writtt its purpose.",
  "Artificial intelligene. The future holds endless possibechnologies.",
  "Great developers writely, knoweded.",
  "The internet is a vast networkate web of connections.",
  "Security in software development is not an afterthowritten with potential vulnerabilities in mind."
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
    socket = io(`ws://${IP}:4000`, {
      transports: ["websocket"],
      query: { playerId }, // Send playerId during initial connection
    });

    
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

  const showToast = (message, type) => {
    toast({
      title: message,
      description: type === "success" ? "success!" : null,
      variant: type,
    });
  };

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
    <div className='min-h-screen flex flex-col items-center justify-center gap-16 bg-[url("/bg.jpg")] bg-cover bg-center'>
      <div className="flex gap-16">
        {/* Create Room Card */}
        <Card className="w-full h-auto max-h-[500px] bg-purple-400 px-7 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-20 border border-gray-100">
          <CardHeader>
            <CardTitle className="text-white text-xl">Create Room</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
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
                className="bg-input"
                onChange={(e) => {
                  setPlayerDisplayName(e.target.value), setError(null);
                }}
              />
              <Input
                placeholder="Room name"
                className="bg-input"
                onChange={(e) => {
                  setRoomName(e.target.value), setError(null);
                }}
              />
              <Button
                className="w-full bg-accent text-black hover:text-accent text-lg"
                onClick={handleCreateRoom}
              >
                Create Room
              </Button>
            </div>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>

        {/* Join Room Card */}
        <Card className="w-full h-auto max-h-[500px] bg-purple-400 px-7 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-20 border border-gray-100">
          <CardHeader>
            <CardTitle className="text-white text-xl">Join Room</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
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
                className="bg-input"
                onChange={(e) => {
                  setPlayerDisplayName(e.target.value), setError(null);
                }}
              />
              <Input
                placeholder="Room ID / Room name"
                className="bg-input"
                onChange={(e) => {
                  setRoomName(e.target.value), setError(null);
                }}
              />
              <Button
                className="w-full bg-accent text-black hover:text-accent text-lg"
                onClick={handleJoinRoom}
              >
                Join Room
              </Button>
            </div>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
      <Link href="/IndividualRoom">
      <Button
                className=" bg-accent text-black hover:text-accent text-2xl p-6"
              >
                Play Alone
      </Button>
      </Link>

      <Link href="/Leaderboard">
      <Button
                className=" bg-accent text-black hover:text-accent text-2xl p-6"
              >
                Leaderboard
      </Button>
      </Link>
      
    </div>
  );
}
