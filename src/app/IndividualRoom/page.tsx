import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import Individual from "@/pages/Individual";
import { Card } from "@/components/ui/card";
import { KeyRound ,ArrowRight, Sparkles, ArrowLeft} from "lucide-react";

import Link from "next/link";
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
  } from '@clerk/nextjs'
import ProfileDropdown from "@/components/Profile";
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
            
            <Card className="p-8 bg-black/30 backdrop-blur-xl  rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
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
                <SignInButton>
                  <button className="w-full flex justify-center group items-center gap-2 bg-yellow-400/5 hover:bg-yellow-400/10 text-yellow-400 px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md">
                    Sign In
                  </button> 
                </SignInButton>
                </SignedOut>
              </div>
            </Card>
  
            {/* Practice card with increased blur */}
            <Card className="p-6 bg-black/20 backdrop-blur-xl  rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-white">
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
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-slate-900 relative">
    {/* Background Blur Layer */}
    <div className="absolute inset-0 backdrop-blur-3xl bg-black/50" />
    <div className="absolute inset-0 bg-[url('/bg.jpg')] bg-cover bg-center opacity-20" />

    {/* Content Container */}
    <div className="relative min-h-screen flex flex-col px-6">
        {/* Navbar (Welcome Card) */}
        <Card className="w-full fixed top-0 left-0 z-50 p-6 backdrop-blur-lg bg-black/30 border-none shadow-2xl">
      <div className="flex items-center gap-6 text-gray-300">
        <Link
           href="/"
           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-none bg-yellow-400/5 text-yellow-400 hover:bg-yellow-400/20 hover:text-yellow-600 transition-all"
         >
            <ArrowLeft size={20} />
          Return Home
        </Link>
    <div className="flex-1">
      <h1 className="text-2xl font-bold text-white">
        Welcome back, {user?.firstName ?? "Imposter"}!
      </h1>
      <p className="text-sm text-gray-400">
        Test your typing speed with random text challenges
      </p>
    </div>
    <ProfileDropdown />
    <SignedIn>
      <UserButton />
    </SignedIn>
  </div>
</Card>

        {/* Typing Challenge Card */}
        <div className="flex justify-center items-center flex-grow pt-24">
                <Individual />
        </div>
    </div>
</div>

    );
}
export default IndividualRoom;
