'use client'
import TypingCmpInd from "../components/TypingCmpInd";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Keyboard, Loader2, Type } from "lucide-react";
import {phrases} from "@/config/phrases"
import {commonWords} from "@/config/words"

const IndividualPractice = () => {
  

  type LengthType = 'short' | 'medium' | 'long';

  type TextType = 'words' | 'phrases';

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
  interface GenerateWordTextParams {
    count: number;
  }

  const generateWordText = ({ count }: GenerateWordTextParams): string => {
    const selectedWords: string[] = [];
    const usedIndices: Set<number> = new Set();
    
    // Keep selecting words until we reach the desired count
    while (selectedWords.length < count) {
      const randomIndex: number = Math.floor(Math.random() * commonWords.length);
      
      // Avoid immediate word repetition
      if (!usedIndices.has(randomIndex)) {
        selectedWords.push(commonWords[randomIndex]);
        usedIndices.add(randomIndex);
        
        // Reset usedIndices if we're running out of unique words
        if (usedIndices.size === commonWords.length) {
          usedIndices.clear();
        }
      }
    }
    
    return selectedWords.join(" ");
  };
  const generateRandomText = () => {
    setReset(true);
    setIsAnimating(true);
    
    let selectedText = "";
    
    if (settings.type === "words") {
      const wordCounts = {
        short: 15,
        medium: 30,
        long: 50
      };
      selectedText = generateWordText({ count: wordCounts[settings.length] });
    } else {
      const availablePhrases = phrases[settings.length];
      if (availablePhrases && availablePhrases.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePhrases.length);
        selectedText = availablePhrases[randomIndex];
      } else {
        selectedText = "No phrases available for the selected length.";
      }
    }
    
    setTimeout(() => {
      setRandomText(selectedText);
      setIsAnimating(false);
      setReset(false);
    }, 500);
  };



  const [, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  

  return (
      <div className="flex flex-col items-center gap-8">
        <Card className="w-full max-w-4xl p-6 bg-black/0 backdrop-blur-sm z-10 border-none">
          <div className="flex flex-col items-center gap-6">
            {/* Settings Panel */}
            <div className="flex gap-4 w-full max-w-md justify-center z-99">
                <Select
                value={settings.type}
                onValueChange={(value: string) => setSettings(prev => ({ ...prev, type: value as 'words' | 'phrases' }))}
                >
                <SelectTrigger className="w-[180px] text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="words">Words</SelectItem>
                  <SelectItem value="phrases">Phrases</SelectItem>
                </SelectContent>
                </Select>

                <Select
                value={settings.length}
                onValueChange={(value: string) => setSettings(prev => ({ ...prev, length: value as LengthType }))}
                >
                <SelectTrigger className="w-[180px] text-white">
                  <SelectValue placeholder="Length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
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
                userId="213"
                playerId="John Doe"
                counter={0}
                sampleText={randomText}
                tozero={reset}
                practice={true}
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
  );
};

export default IndividualPractice;

export async function getServerSideProps() {
  return { props: {} };
}