import {currentUser} from "@clerk/nextjs/server"
import { useEffect, useState, useRef } from "react"
import Image from "next/image";
import {ClerkProvider, SignedIn, SignedOut, SignInButton, SignOutButton, useUser} from '@clerk/nextjs'
import { KeyRound, Loader2, Type } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import clsx from "clsx";

const Profile = () =>{
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userName, setUserName] = useState("");
    const [isOpen, setOpen] = useState(false);
    const [Changes, setChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {isSignedIn, isLoaded, user} = useUser();
    const firstname = document.getElementById("firstname") as HTMLInputElement;
    const lastname = document.getElementById("lastname") as HTMLInputElement;
    const username = document.getElementById("username") as HTMLInputElement;
    useEffect(() => {
      if (firstName.length > 0 || lastName.length > 0 || userName.length > 0){
        setChanges(true);
      }else {
        setChanges(false);
      }
    }, [firstName.length || lastName.length || userName.length]);

    const handleChangeName = async() => {
           setIsLoading(true);
           const response = await fetch("/api/update-user", {
                method: "POST",
                body: JSON.stringify({
                  userId: user?.id,
                 username: userName,
                 firstName: firstName,
                 lastName: lastName,   
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (firstname.value || lastname.value || username.value){
              firstname!.value = "";
              lastname!.value = "";
              username!.value = "";
              setFirstName("");
              setLastName("");
              setUserName("");
              setChanges(false);
              setIsLoading(false);
              return;
            }
           
            if (response.ok){
                let data = await response.json();
                setIsLoading(false);
                await user?.reload();
                return data;
            }else {
              setIsLoading(false);
                throw new Error('Failed to update user');
            }
           
    }
    if (!isLoaded) {
        return (
          <ClerkProvider>
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                <p className="text-lg text-gray-200">Loading your data...</p>
              </div>
            </div>
          </ClerkProvider>
        );
      }

      if (!isSignedIn) {
        return (
          <ClerkProvider>
            <div className="flex items-center justify-center">
              <Card className="p-4 flex flex-col items-center text-center gap-3 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <KeyRound size={40} className="text-yellow-400" />
              <div className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold mb-2 text-white">Access Required</h2>
              <p className="text-gray-400">Please sign in to access the typing practice</p>
              <SignedOut>
                                <SignInButton>
                                  <button className="w-full flex justify-center group items-center gap-2 bg-yellow-400/5 hover:bg-yellow-400/10 text-yellow-400 px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md">
                                    Sign In
                                  </button> 
                                </SignInButton>
              </SignedOut>
              </div>
              </Card>
            </div>
          </ClerkProvider>
        );
      }
    
    return (
        <ClerkProvider polling>
        <div className="w-[250px] space-y-1">
            <div onClick={() => setOpen(!isOpen)} className="w-full text-center cursor-pointer gap-2 flex flex-col justify-center items-center p-2 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <p className="text-sm text-center text-gray-300 font-semibold">Logged as :</p>
                  <div className="flex gap-3 justify-center items-center">
                  <img src={user.imageUrl} width={40} height={40} className="rounded-full" alt={user.username!} />
                  <h2 className="text-yellow-400 w-[200px] font-semibold truncate">{user.firstName} {user.lastName}</h2>
                  </div>
            </div>
            <ul className={clsx("w-full text-center flex flex-col justify-center items-center p-3 gap-3 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl  duration-300", isOpen ? "" : "hidden")}>
              <span className="flex flex-col gap-2">
                <Input value={firstName} id="firstname" onChange={(e) => setFirstName(e.target.value)} placeholder="Firstname" className="bg-[#E5E5E5] " />
                <Input value={lastName}  id="lastname" onChange={(e) => setLastName(e.target.value)} placeholder="Lastname" className="bg-[#E5E5E5] " />
                <Input value={userName}  id="username" onChange={(e) => setUserName(e.target.value)} placeholder="Username" className="bg-[#E5E5E5] " />
              </span>
              <Button disabled={!Changes} onClick={handleChangeName} className="w-full disabled:bg-white/50 flex justify-center group items-center gap-2 bg-yellow-400/5 hover:bg-yellow-400/10 text-yellow-400 px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md" > {isLoading ? (    <div className="flex items-center gap-2">
      <span>Saving</span>
      <Loader2 className="animate-spin h-5 w-5" /> 
    </div>) : ("Save")} </Button>
            </ul>
            {user && <div>
              <SignInButton>
                                <SignOutButton>
                                  <button className="w-full flex justify-center group items-center gap-2 bg-yellow-400/5 hover:bg-yellow-400/10 text-yellow-400 px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md">
                                    Sign Out
                                  </button> 
                                </SignOutButton>
              </SignInButton>
              </div>}
        </div>
        </ClerkProvider>
    )
}

export default Profile;