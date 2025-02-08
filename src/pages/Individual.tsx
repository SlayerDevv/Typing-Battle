'use client'
import { useUser } from "@clerk/nextjs";
import TypingCmpInd from "../components/TypingCmpInd";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Keyboard, Loader2, Type } from "lucide-react";
import { ClerkProvider } from "@clerk/nextjs";

const Individual = () => {
  // Sample words for word mode
  const commonWords = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", 
    "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", 
    "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", 
    "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", 
    "about", "who", "get", "which", "go", "me", "when", "make", "can", "like",
    "time", "just", "him", "know", "take", "people", "into", "year", "your",
    "good", "some", "could", "them", "see", "other", "than", "then", "now",
    "look", "only", "come", "its", "over", "think", "also", "back", "after",
    "use", "two", "how", "our", "work", "first", "well", "way", "even", "new",
    "want", "because", "any", "these", "give", "day", "most", "us", "time",
  ];

  const phrases = {
    short: [
      "The coffee machine hummed quietly in the corner as morning sunlight filtered through the kitchen window.",
  "She grabbed her keys and rushed out the door, hoping to catch the last train home.",
  "The old bookstore held countless stories within its weathered walls and creaking wooden shelves.",
  "Children's laughter echoed across the playground as clouds drifted lazily overhead.",
  "The cat stretched lazily on the windowsill, watching birds flutter past in the garden.",
  "Fresh snow blanketed the city streets, turning the urban landscape into a winter wonderland.",
  "He typed furiously at his keyboard, racing against time to meet the deadline.",
  "The aroma of freshly baked bread wafted through the neighborhood early Sunday morning.",
  "Waves crashed rhythmically against the shore as seagulls circled overhead, searching for their next meal.",
  "The museum's ancient artifacts told silent stories of civilizations long past.",
  "Stars twinkled brightly in the clear night sky, creating nature's own light show.",
  "The garden burst with color as spring flowers began their annual display.",
  "A gentle breeze rustled through the trees, carrying the sweet scent of blooming jasmine.",
  "The artist's brush danced across the canvas, bringing imagination to life with each stroke.",
  "Rain tapped gently against the windows while thunder rumbled in the distance."
    ],
    medium: [
      "The local farmers' market bustled with activity as vendors arranged their fresh produce and handcrafted goods, while early morning shoppers carefully selected the best ingredients for their weekend meals.",
  "In the cozy coffee shop downtown, students huddled over laptops and textbooks, sipping steaming drinks while soft jazz music played in the background, creating the perfect study atmosphere.",
  "The hiking trail wound its way through ancient pine forests, crossing bubbling streams and revealing breathtaking valley views that made every challenging step worthwhile for the adventurous trekkers.",
  "As the sun set over the city skyline, office workers began their evening commute home, while street musicians filled the cooling air with melodies that echoed between tall buildings.",
  "The small town's annual festival brought together locals and visitors alike, filling the main street with the sounds of live music, the smell of street food, and the joy of community.",
  "Inside the busy restaurant kitchen, chefs moved with practiced precision, transforming raw ingredients into culinary masterpieces while servers orchestrated a complex dance of service.",
  "The old grandfather clock in the hallway marked time with steady precision, its gentle ticking a reminder of countless moments shared within these familiar walls.",
  "During the summer evening, fireflies danced through the garden like tiny lanterns, while crickets provided their nightly symphony and a gentle breeze carried the scent of jasmine.",
  "The antique bookshop's shelves held countless stories waiting to be discovered, their leather-bound spines and yellowed pages promising adventures to those who dared explore them.",
  "As rain fell steadily outside, the library remained a haven of quiet concentration, with readers lost in their chosen worlds while others browsed shelves for their next literary escape.",
  "The art gallery opening attracted a diverse crowd of enthusiasts and critics, each person finding their own meaning in the colorful canvases that adorned the pristine walls.",
  "Morning fog rolled through the valley, gradually revealing the landscape as the sun rose higher, while early risers began their daily routines in the peaceful countryside setting.",
  "The botanical garden showcased nature's diversity in carefully curated displays, from delicate orchids to towering palms, each plant telling its own story of adaptation and survival.",
  "Professional dancers moved gracefully across the studio floor, their reflections multiplied in wall-length mirrors as they prepared for the upcoming performance with determined concentration.",
  "The weekend market square transformed into a vibrant tapestry of colors and cultures, with international food stalls and local artisans sharing their traditions with curious visitors."
    ],
    long: [
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
    "The local farmers' market bustled with activity as vendors arranged their fresh produce and handcrafted goods, while early morning shoppers carefully selected the best ingredients for their weekend meals.",
    ]
  };

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
        <Card className="w-full max-w-4xl p-6 bg-black/40 backdrop-blur-sm border-none">
          <div className="flex flex-col items-center gap-6">
            {/* Settings Panel */}
            <div className="flex gap-4 w-full max-w-md justify-center">
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
                tozero={reset}
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