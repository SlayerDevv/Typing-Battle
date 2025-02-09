import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import Individual from "@/pages/Individual";
import { Card } from "@/components/ui/card";
import { KeyRound ,ArrowRight} from "lucide-react";

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
      <div className="min-h-screen flex flex-col gap-8 items-center justify-center  bg-[url('/bg.jpg')] bg-cover bg-cente relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700" />
      </div>

      {/* Main content */}
      <Card className="w-full max-w-md p-8 backdrop-blur-xl bg-white/10 border-none shadow-2xl transform hover:scale-105 transition-transform duration-300">
        <div className="flex flex-col items-center gap-6 text-white">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-50 animate-pulse" />
            <KeyRound size={48} className="text-yellow-400 relative animate-bounce" />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Access Required
            </h1>
            <p className="text-gray-300 text-lg">
              Sign in to save your progress
            </p>
          </div>

          <SignedOut>
            <SignInButton />
          </SignedOut>
        </div>
      </Card>

      {/* Practice option card */}
      <Card className="w-full max-w-md p-6 backdrop-blur-xl bg-white/5 border-none shadow-2xl transform hover:scale-105 transition-transform duration-300">
        <div className="flex flex-col items-center gap-4 text-white text-center">
          <p className="text-gray-300">
            Want to practice without saving stats?
          </p>
          <Link 
            href="/PracticeRoom"
            className="group flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
          >
            Start practicing
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
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
