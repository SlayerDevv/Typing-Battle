import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import Individual from "@/pages/Individual";
import { Card } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
  } from '@clerk/nextjs'
const IndividualRoom: React.FC = async () => {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/bg.jpg')] bg-cover bg-center">
        <Card className="p-8 backdrop-blur-md bg-black/30 border-none shadow-2xl">
          <div className="flex flex-col items-center gap-4 text-white">
            <KeyRound size={48} className="text-yellow-400 animate-pulse" />
            <h1 className="text-2xl font-bold">Access Required</h1>
            <p className="text-gray-200">Please sign in to access this page</p>
            <SignedOut>
                  <SignInButton/>
                </SignedOut>
          </div>
        </Card>
      </div>
    );
  }

  const user = await currentUser();

  return (
    <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed">
   
      <div className="min-h-screen backdrop-blur-sm bg-black/40">
        <div className="container mx-auto pt-4">
        <div className="">
  <Card className="p-4 backdrop-blur-md bg-black/30 border-none shadow-2xl ">
    <div className="flex items-center gap-4 text-white ">
    <Link
        href="/"
        className="text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
    >
        Return Home
    </Link>
      <img className="w-12 h-12 rounded-full" src={user?.imageUrl} alt="profile-image" />
      <div className="flex-1">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-sm text-gray-200">
          Test your typing speed with random text challenges
        </p>
      </div>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  </Card>
</div>
          
          <div className="mt-6">
            <Card className="backdrop-blur-md bg-black/30 border-none shadow-2xl">
              <Individual />
            </Card>
          </div>
        </div>
      </div>
    </div>

  );
};

export default IndividualRoom;
