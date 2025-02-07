"use client"
import { useUser } from "@clerk/nextjs";
import TypingCmpInd from "../components/TypingCmpInd";
import { useState,useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "@/components/ui/card";
import { Keyboard, Loader2, Type } from "lucide-react";
import { ClerkProvider } from "@clerk/nextjs";
const Individual = () => {
  const phrases = [
    "The old library, with its towering shelves filled with dusty tomes and ancient manuscripts, seemed to hold the secrets of centuries past, whispering stories of forgotten worlds and long-lost civilizations to those who dared to listen closely in the silence.",
    "As the storm clouds gathered on the horizon, the once-calm sea began to churn violently, its waves rising like giants ready to clash, while the fishermen hurried to secure their boats, hoping to outlast nature's fury.",
    "The bustling marketplace was a kaleidoscope of colors, sounds, and smells, with vendors calling out to passersby, offering everything from fresh produce to handmade crafts, creating a vibrant tapestry of life and commerce.",
    "High in the mountains, where the air was thin and the snow never melted, the climbers pressed on, their determination unwavering despite the biting cold and the treacherous terrain that tested their limits at every step.",
    "The orchestra's music swelled, filling the grand concert hall with a symphony of emotions, each note telling a story of love, loss, and triumph, as the audience sat in rapt silence, completely captivated by the performance.",
    "In the quiet hours of the night, when the world seemed to stand still, the writer sat by the dim light of a desk lamp, pouring their thoughts onto paper, crafting a story that would one day inspire countless others.",
    "The ancient ruins, hidden deep within the jungle, stood as a silent reminder of a once-great civilization, their stone walls covered in intricate carvings that told the tales of gods, warriors, and kings long forgotten by time.",
    "As the train rattled along the tracks, the passengers gazed out at the passing landscape, each lost in their own thoughts, while the rhythmic clatter of the wheels created a soothing backdrop to their journeys.",
    "The chef worked tirelessly in the kitchen, their hands moving with precision and grace as they transformed simple ingredients into a masterpiece of flavors, each dish a reflection of their passion and creativity.",
    "The city skyline, illuminated by the golden hues of the setting sun, stood as a testament to human ingenuity and ambition, its towering skyscrapers reaching for the heavens like modern-day monuments to progress.",
    "In the depths of space, where stars burned brightly against the infinite darkness, the spacecraft drifted silently, its crew marveling at the beauty and vastness of the universe that stretched out before them.",
    "The festival was a riot of colors and sounds, with dancers moving to the rhythm of traditional drums, their vibrant costumes swirling like living art, while the aroma of street food filled the air, tempting everyone who passed by.",
    "The detective carefully examined the clues scattered across the crime scene, piecing together the puzzle with a sharp mind and unwavering focus, determined to uncover the truth hidden beneath layers of deception.",
    "The garden, a sanctuary of peace and beauty, was alive with the hum of bees and the fragrance of blooming flowers, each plant carefully tended to by the gardener, who saw their work as a labor of love.",
    "As the first rays of dawn broke over the horizon, the world slowly awakened, the sky painted in shades of pink and orange, while the birds began their morning chorus, heralding the start of a new day full of possibilities.",
  ];

  const [randomText, setRandomText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const generateRandomText = () => {
    setIsAnimating(true);
    const randomIndex = Math.floor(Math.random() * phrases.length);
    const selectedText = phrases[randomIndex];
    
    // Add a slight delay for better UX
    setTimeout(() => {
      setRandomText(selectedText);
      setIsAnimating(false);
    }, 500);
  };

  const { isSignedIn, user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  console.log(mounted)

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
    <div className="flex flex-col items-center gap-8 p-6">

      <Card className="w-full max-w-4xl p-6 bg-black/40 backdrop-blur-sm border-none">
        <div className="flex flex-col items-center gap-6">
          <Button
            onClick={generateRandomText}
            disabled={isAnimating}
            className="group relative flex items-center gap-2 bg-accent text-black hover:text-accent text-xl py-6 px-8 transition-all duration-300 hover:shadow-lg"
          >
            <Keyboard className="w-6 h-6 transition-transform group-hover:scale-110" />
            {isAnimating ? (
              <span className="flex items-center gap-2">
                Generating <Loader2 className="w-4 h-4 animate-spin" />
              </span>
            ) : (
              "Generate New Text"
            )}
          </Button>

          {randomText ? (
            <TypingCmpInd
              playerId={user?.fullName || ""}
              counter={0}
              sampleText={randomText}
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