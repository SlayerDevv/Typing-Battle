'use client'
import { useUser } from "@clerk/nextjs";
import TypingCmpInd from "../components/TypingCmpInd";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Keyboard, Loader2, Type } from "lucide-react";
import { ClerkProvider } from "@clerk/nextjs";
import {phrases} from "@/config/phrases"
const Individual = () => {
  

  type LengthType = 'medium' | 'long';

  type TextType =  'phrases';

  const [settings, setSettings] = useState<{
    type: TextType;
    length: LengthType;
  }>({
    type: "phrases", // 'words' or 'phrases'
    length: "medium", // 'short', 'medium', 'long'
  });
  
  const [randomText, setRandomText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [reset, setReset] = useState(false);


  const generateRandomText = () => {
    setReset(true);
    setIsAnimating(true);
    
    let selectedText = "";
    

      const availablePhrases = phrases[settings.length];
      if (availablePhrases && availablePhrases.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePhrases.length);
        selectedText = availablePhrases[randomIndex];
      } else {
        selectedText = "No phrases available for the selected length.";
      }
    
    
    setTimeout(() => {
      setRandomText(selectedText);
      setIsAnimating(false);
      setReset(false);
    }, 500);
  };



  const { isSignedIn, user, isLoaded } = useUser();
  const [, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isLoaded) {
    return (
      <ClerkProvider>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-lg text-gray-200">Loading your practice session...</p>
          </div>
        </div>
      </ClerkProvider>
    );
  }

  if (!isSignedIn) {
    return (
      <ClerkProvider>
        <div className="min-h-[50vh] flex items-center justify-center">
          <Card className="p-8 text-center">
            <Type className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h2 className="text-xl font-semibold mb-2">Access Required</h2>
            <p className="text-gray-400">Please sign in to access the typing practice</p>
          </Card>
        </div>
      </ClerkProvider>
    );
  }

  return (
    <ClerkProvider>
      <div className="flex flex-col items-center gap-8">
        <Card className="w-full max-w-4xl p-6 bg-black/8 backdrop-blur-sm border-none">
          <div className="flex flex-col items-center gap-6">
           
            <div className="flex gap-4 w-full max-w-md justify-center">
                

                <Select
                value={settings.length}
                onValueChange={(value: string) => setSettings(prev => ({ ...prev, length: value as LengthType }))}
                >
                <SelectTrigger className="w-[180px] text-white">
                  <SelectValue placeholder="Length" />
                </SelectTrigger>
                <SelectContent>
                  
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
                </Select>
            </div>

            <Button
                onClick={generateRandomText}
                disabled={isAnimating}
                variant="outline"
                className="group relative flex items-center gap-2 bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-sm py-2 px-4 rounded-md transition-all duration-200"
              >
                {isAnimating ? (
                  <span className="flex items-center gap-2">
                    generating <Loader2 className="w-4 h-4 animate-spin" />
                  </span>
                ) : (
                  <>
                    <Keyboard className="w-4 h-4" />
                    Generate
                  </>
                )}
              </Button>

            {randomText ? (
              <TypingCmpInd
                userId={user.id}
                playerId={user?.fullName || ""}
                counter={0}
                sampleText={randomText}
                tozero={reset}
                practice={false}
              />
            ) : (
              <div className="text-center p-8 text-gray-400">
                <Type className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Click the button above to generate a text and start practicing</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </ClerkProvider>
  );
};

export default Individual;

export async function getServerSideProps() {
  return { props: {} };
}