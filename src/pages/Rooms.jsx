"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Card,
  CardContent,
  CardDescription,
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

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

export default function RoomsPage() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState("");
  const [playerDisplayName, setPlayerDisplayName] = useState(""); // For player display name input
  const [roomName, setRoomName] = useState(""); // For room name input
  const [error, setError] = useState(null);

  useEffect(() => {
    socket.on("connect", () => {
      const playerId = localStorage.getItem("playerId") || uuidv4();
      localStorage.setItem("playerId", playerId);
      setPlayerId(playerId);
      socket.emit("setPlayerId", playerId);
    });

    socket.on("roomCreated", ({ roomId, playerId, playerName }) => {
      console.log(`roomCreated: playerId from server: ${playerId}`);
      router.push(
        `/TypingRoom?roomId=${roomId}&playerId=${playerId}&playerName=${playerName}`
      );
    });

    socket.on("playerJoined", ({ roomId, playerId, playerName }) => {
      console.log(`playerJoined: playerId from server: ${playerId}`);
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
      socket.off("playerDisconnected");
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
        playerName,
        playerId,
      });
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
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[url("/bg.jpg")] bg-cover bg-center'>
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
    </div>
  );
}
