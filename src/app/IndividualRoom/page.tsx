import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import Individual from "@/pages/Individual";
import { Card } from "@/components/ui/card";
import { KeyRound ,ArrowRight, Sparkles} from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center relative bg-slate-900">
       
        <div className="absolute inset-0 backdrop-blur-5xl">
        <div className="absolute inset-0 bg-[url('/bg.jpg')]  bg-cover bg-center opacity-20" />

        </div>
  
       
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/3 w-[30rem] h-[30rem] bg-yellow-400/20 rounded-full mix-blend-overlay filter blur-[100px] animate-pulse" />
            <div className="absolute top-1/3 right-1/4 w-[35rem] h-[35rem] bg-orange-400/15 rounded-full mix-blend-overlay filter blur-[120px] animate-pulse delay-1000" />
            <div className="absolute bottom-1/4 left-1/2 w-[25rem] h-[25rem] bg-amber-400/20 rounded-full mix-blend-overlay filter blur-[90px] animate-pulse delay-700" />
          </div>
        </div>
  
     
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/70 backdrop-blur-sm" />
  
        <div className="relative w-full max-w-5xl p-4 flex flex-col lg:flex-row items-center gap-6">
          
          <div className="lg:w-2/5 text-center lg:text-left space-y-6 text-white">
            <h1 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-200 to-amber-100">
              Welcome to Your Journey
            </h1>
            <p className="text-lg text-yellow-100/70 backdrop-blur-sm">
              Track your progress, unlock achievements, and join our community of learners.
            </p>
          </div>
  
          
          <div className="lg:w-3/5 flex flex-col gap-6 w-full max-w-md">
            
            <Card className="p-8 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-40 animate-pulse" />
                  <KeyRound size={40} className="text-yellow-400 relative" />
                </div>
  
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold text-white">
                    Access Required
                  </h2>
                  <p className="text-yellow-100/70">
                    Sign in to save your progress
                  </p>
                </div>
  
                <SignedOut>
                  <div className="w-full flex justify-center group items-center gap-2 bg-yellow-400/5 hover:bg-yellow-400/10 text-yellow-400 px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md">
                    <SignInButton />
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </SignedOut>
              </div>
            </Card>
  
            {/* Practice card with increased blur */}
            <Card className="p-6 bg-black/20 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-lg font-medium">Quick Start Option</span>
                </div>
                
                <Link
                  href="/PracticeRoom"
                  className="group w-full flex items-center justify-center gap-2 bg-yellow-400/5 hover:bg-yellow-400/10 text-yellow-400 px-6 py-3 rounded-xl transition-all duration-200 backdrop-blur-md"
                >
                  Start practicing now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                
                <p className="text-sm text-yellow-200/50 text-center">
                  Try without an account - no progress saving
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };
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
