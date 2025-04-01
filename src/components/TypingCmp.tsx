import React, { useState, useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { textOptions } from '@/config/phrases';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  totalTyped: number;
}

interface TypingCmpProps {
  socket: Socket;
  roomId: string;
  playerId: string;
  counter: number;
  sampleText: string;
 
  
}
import { Socket } from "socket.io-client";
import { themes } from '@/config/themes';
type ThemeKey = keyof typeof themes;

const TypingCmp: React.FC<TypingCmpProps> = ({ socket, roomId, playerId, counter,sampleText }) => {

  
  
  const [userInput, setUserInput] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [currentErrors, setCurrentErrors] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSoundEnabled,setIsSoundEnabled ] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('minimal');
  const [fontSize, setFontSize] = useState<string>("text-lg"); // Default size
  
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 0,
    errors: 0,
    totalTyped: 0,
  });
  const [opponentStats, setOpponentStats] = useState<{
    playerName: string;
    wpm: number;
    accuracy: number;
    errors: number;
  } | null>(null);
  
 
  const [currentText, setCurrentText] = useState<string>(sampleText);
  const textAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);

  
  const handleThemeChange = (value: ThemeKey) => {
    setCurrentTheme(value);
    // Maintain focus after theme change
    textAreaRef.current?.focus();
  };

  useEffect(() => {
    console.log("useEffect called")
    socket.on("textChanged", ({ text }: { text: string }) => {
      setCurrentText(text);
      console.log("text have been changed in useEffect")
      setUserInput("");
    setStartTime(null);
    setCurrentPosition(0);
    setCurrentErrors(0);
    setIsCompleted(false);
    setStats({
      wpm: 0,
      accuracy: 100,
      errors: 0,
      totalTyped: 0,
    });
    setOpponentStats(
      opponentStats ? {
        ...opponentStats,
        wpm: 0,
        accuracy: 100,
        errors: 0,
      } : null
    );
  
    // Focus back on the text area
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
    });

  }, [socket]);
  

  useEffect(() => {
    // Only set up the player stats listener once
    socket.on("playerStats", ({ playerId: statsPlayerId, playerName: statsPlayerName, stats }: { playerId: string, playerName: string, stats: TypingStats }) => {
      if (statsPlayerId !== playerId) {
        setOpponentStats({
          playerName: statsPlayerName,
          ...stats,
        });
      }
    });
  
    // Cleanup the listener when component unmounts
    return () => {
      socket.off("playerStats");
    };
  }, [socket, playerId]); // Only depend on socket and playerId
  
  // Third useEffect - check completion
  useEffect(() => {
    if (userInput.length === currentText.length ) {
      setIsCompleted(true);
      socket.emit('raceCompleted', {
        roomId,
        playerId,
        stats
      });
    }
  }, [userInput, currentText, roomId, playerId, stats,socket,opponentStats]);
 
  const calculateStats = () => {
    if (!startTime) {
      setStartTime(Date.now());
      return;
    }

    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const wordsTyped = Math.round(currentPosition / 5);
    const wpm = Math.round(wordsTyped / timeElapsed) || 0;

    const currentErrorCount = Array.from(userInput).reduce((count, char, index) => {
      return count + (char !== currentText[index] ? 1 : 0);
    }, 0);

    setCurrentErrors(currentErrorCount);

    const accuracy = Math.round(
      ((currentPosition - currentErrorCount) / currentPosition) * 100
    ) || 100;

    setStats({
      wpm: timeElapsed > 0 ? wpm : 0,
      accuracy,
      errors: currentErrorCount,
      totalTyped: currentPosition,
    });
  };

  // Audio refs
  const correctKeySound = useRef<HTMLAudioElement | null>(null);
  const errorKeySound = useRef<HTMLAudioElement | null>(null);
  const spaceKeySound = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    correctKeySound.current = new Audio('/sounds/key-press.mp3');
    errorKeySound.current = new Audio('/sounds/key-error.mp3');
    spaceKeySound.current = new Audio('/sounds/key-space.mp3');

    // Optional: Preload sounds
    correctKeySound.current.preload = 'auto';
    errorKeySound.current.preload = 'auto';
    spaceKeySound.current.preload = 'auto';
  }, []);

  const playSound = (type: 'correct' | 'error' | 'space') => {
    if (!isSoundEnabled) return;

    const sound = type === 'correct' ? correctKeySound.current :
                 type === 'error' ? errorKeySound.current :
                 spaceKeySound.current;

    if (sound) {
      sound.currentTime = 0; // Reset sound to start
      sound.play().catch(e => console.error('Error playing sound:', e));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
    }

    if (e.key === 'Backspace') {
      if (e.ctrlKey) {
        // Trim trailing spaces and find the last word
        const newInput = userInput.trimEnd();
        const lastSpaceIndex = newInput.lastIndexOf(" ");
  
        if (lastSpaceIndex !== -1) {
          setUserInput(userInput.substring(0, lastSpaceIndex + 1)); // Keep the space before the word
          setCurrentPosition(lastSpaceIndex + 1);
        } else {
          setUserInput(""); // If no space exists, clear everything
          setCurrentPosition(0);
        }
    } else {
      if (userInput.length > 0) {
        setUserInput(prev => prev.slice(0, -1));
        setCurrentPosition(prev => prev - 1);
      }
    }
    calculateStats();
    playSound('correct');
    } else if (e.key.length === 1 && userInput.length < currentText.length) {
      const newInput = userInput + e.key;
      setUserInput(newInput);
      setCurrentPosition(newInput.length);
      calculateStats();
      // Determine which sound to play
      if (e.key === ' ') {
        playSound('space');
      } else if (e.key === currentText[userInput.length]) {
        playSound('correct');
      } else {
        playSound('error');
      }
    }
  };

  const renderText = () => {
    return (
      <>
        {Array.from(currentText).map((char, index) => {
          let charClass = "text-gray-400";
          
          if (index < userInput.length) {
            if (userInput[index] === char) {
              charClass = themes[currentTheme].className;
            } else {
              charClass = "text-red-500";
            }
          } else if (index === userInput.length) {
            charClass = "text-white bg-white/20";
          }

          const isSpace = char === " ";
          const extraClass = isSpace ? "mr-1" : "";

          return (
            <span key={index} className={`${charClass} ${extraClass}`}>
              {char}
            </span>
          );
        })}
      </>
    );
  };

  useEffect(() => {
    if (startTime) {
      socket.emit('updateStats', {
        roomId,
        playerId,
        stats: {
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          errors: currentErrors
        }
      });
    }
  }, [stats.wpm, stats.accuracy, currentErrors]);


  const handleReset = () => {
  
    setUserInput("");
    setStartTime(null);
    setCurrentPosition(0);
    setCurrentErrors(0);
    setIsCompleted(false);
    setStats({
      wpm: 0,
      accuracy: 0,
      errors: 0,
      totalTyped: 0,
    });
    setOpponentStats(
      opponentStats ? {
        ...opponentStats,
        wpm: 0,
        accuracy: 100,
        errors: 0,
      } : null
    );
  
    // Focus back on the text area
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }

    socket.emit("resetRoom", { roomId, playerId });
  
    // Emit reset event to server if needed
    socket.emit('playerReset', {
      roomId,
      playerId,
    });
  };


  const handleChangeText = () => {
    const newText = textOptions[Math.floor(Math.random() * textOptions.length)];
    setCurrentText(newText);
    console.log("text have been changed")
    setUserInput("");
    setStartTime(null);
    setCurrentPosition(0);
    setCurrentErrors(0);
    setIsCompleted(false);
    setStats({
      wpm: 0,
      accuracy: 100,
      errors: 0,
      totalTyped: 0,
    });
    setOpponentStats(
      opponentStats ? {
        ...opponentStats,
        wpm: 0,
        accuracy: 100,
        errors: 0,
      } : null
    );
  
    // Focus back on the text area
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }

    socket.emit("resetText", { roomId, text: newText });
    socket.emit("changeText", { roomId, text: newText });
  }

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    // Maintain focus after font size change
    setTimeout(() => {
      textAreaRef.current?.focus();
    }, 0);
  };
  return (
    <div className=" mx-auto w-full lg:w-2/3 p-6 space-y-6">
      <div className="stats flex justify-between mb-4 text-lg text-white">
      <div>WPM: <b>{stats.wpm}</b></div>
        <div>Accuracy: <b>{stats.accuracy}%</b></div>
        <div>Errors: <b>{currentErrors}</b></div>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/90 backdrop-blur-sm shadow-lg">
  <div className="flex items-center justify-between gap-3 w-full">
    <Select value={currentTheme} onValueChange={handleThemeChange}>
      <SelectTrigger className="w-40 bg-gray-700 border-gray-600 rounded-md text-white hover:bg-gray-600 transition-colors">
        <div className="flex items-center">
          <SelectValue placeholder="Select theme" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-gray-700 border-gray-600 text-white rounded-md">
        {Object.keys(themes).map((theme) => (
          <SelectItem 
            key={theme} 
            value={theme} 
            className="hover:bg-gray-600 focus:bg-gray-600"
          >
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: themes[theme as ThemeKey].primary || '#fff' }}
              />
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
         <Select value={fontSize} onValueChange={handleFontSizeChange}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 rounded-md text-white hover:bg-gray-600 transition-colors">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Aa</span>
                  <SelectValue placeholder="Size" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 text-white rounded-md">
                <SelectItem value="text-sm" className="hover:bg-gray-600 focus:bg-gray-600">Small</SelectItem>
                <SelectItem value="text-lg" className="hover:bg-gray-600 focus:bg-gray-600">Medium</SelectItem>
                <SelectItem value="text-xl" className="hover:bg-gray-600 focus:bg-gray-600">Large</SelectItem>
                <SelectItem value="text-2xl" className="hover:bg-gray-600 focus:bg-gray-600">X-Large</SelectItem>
              </SelectContent>
            </Select>

  <Button 
    onClick={() => {setIsSoundEnabled(!isSoundEnabled)}}
    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
  >
    {isSoundEnabled ? (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
        Mute
      </>
    ) : (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
        Unmute
      </>
    )}
  </Button>
</div>
</div>
      {/* Typing Area */}
            <div
              ref={textAreaRef}
              tabIndex={0}
              onKeyDown={counter > 0 ? undefined : handleKeyDown}
              className={`px-6 p-3 rounded-lg font-mono ${fontSize} leading-relaxed 
                whitespace-pre-wrap focus:outline-none focus:ring-1 focus:ring-[${themes[currentTheme].primary}] min-h-[180px]
                 duration-200 ${themes[currentTheme].className}`}
            >
              {renderText()}
      </div>
      <AlertDialog open={isCompleted}>
        <AlertDialogContent className="bg-gray-800 text-white border-none ">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-center mb-4">
              Text Completed! 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-lg text-center">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="font-semibold text-white">WPM</div>
                  <div className="text-2xl text-green-500 font-bold">{stats.wpm}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="font-semibold text-white">Accuracy</div>
                  <div className="text-2xl text-blue-500 font-bold">
                    {stats.accuracy}%
                  </div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="font-semibold text-white">Errors</div>
                  <div className="text-2xl text-red-500 font-bold">{stats.errors}</div>
                </div>
              </div>
              {opponentStats && (
                <div>
                  <AlertDialogTitle className="text-2xl font-bold text-center mt-4 text-white">
                    {opponentStats.playerName} Stats
                  </AlertDialogTitle>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="font-semibold text-white">WPM</div>
                      <div className="text-2xl text-green-500 font-bold">
                        {opponentStats.wpm}
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="font-semibold text-white">Accuracy</div>
                      <div className="text-2xl text-blue-500 font-bold">
                        {opponentStats.accuracy}%
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="font-semibold text-white">Errors</div>
                      <div className="text-2xl text-red-500 font-bold">
                        {opponentStats.errors}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setIsCompleted(false)}
              className="bg-green-500 hover:bg-green-600 w-1/2 text-lg font-bold p-4 rounded-lg border"
            >
              Close
            </AlertDialogAction>
            <AlertDialogAction
                onClick={handleReset}
                    className="px-4 py-2 bg-purple-600 w-1/2 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Restart Game
              </AlertDialogAction>
              <AlertDialogAction
                onClick={handleChangeText}
                    className="px-4 py-2 bg-blue-600 w-1/2 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Change text and restart
              </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TypingCmp;