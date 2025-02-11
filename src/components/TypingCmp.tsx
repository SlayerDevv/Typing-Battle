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


const TypingCmp: React.FC<TypingCmpProps> = ({ socket, roomId, playerId, counter,sampleText}) => {
  
  const [userInput, setUserInput] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [currentErrors, setCurrentErrors] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSoundEnabled] = useState(true);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
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

  useEffect(() => {
    socket.on("textChanged", ({ newText }: { newText: string }) => {
      setCurrentText(newText);
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
    return () => {
      socket.off("textChanged");
    };
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
        let newInput = userInput.trimEnd();
        let lastSpaceIndex = newInput.lastIndexOf(" ");
  
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
              charClass = "text-white";
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
    // Reset all states to initial values
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

    socket.emit("resetRoom", { roomId, playerId });
  
    // Emit reset event to server if needed
    socket.emit('playerReset', {
      roomId,
      playerId,
    });
  };
  const textOptions = [
    "The quick brown fox jumps over the lazy dog. Programming is the art of telling another human what one wants the computer to do.",
    "In the world of coding, every semicolon matters. A single character can make the difference between a working program and a syntax error that keeps you debugging for hours.",
    "Technology has revolutionized the way we live, work, and connect with others. As we continue to innovate, the possibilities seem endless in this digital age.",
    "Software development is like building a house. You need a solid foundation, careful planning, and attention to detail. Testing ensures your structure won't collapse.",
    "The best code is not just functional but also readable and maintainable. Clean code reads like well-written prose and tells a story about its purpose.",
    "Artificial intelligence and machine learning are transforming industries across the globe. The future holds endless possibilities for those who embrace these technologies.",
    "Great developers write code that humans can understand. Documentation is not just helpful; it's essential for maintaining and scaling software projects effectively.",
    "Version control is like a time machine for your code. Git allows developers to experiment freely, knowing they can always return to a working state if needed.",
    "The internet is a vast network connecting billions of devices worldwide. Every click, every search, and every message travels through this intricate web of connections.",
    "Security in software development is not an afterthought but a fundamental requirement. Every line of code must be written with potential vulnerabilities in mind."
  ];
  

  const handleChangeText = () => {
    const newText = textOptions[Math.floor(Math.random() * textOptions.length)];
    setCurrentText(newText);
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


  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="stats flex justify-between mb-4 text-lg text-white">
        <div>WPM: {stats.wpm}</div>
        <div>Accuracy: {stats.accuracy}%</div>
        <div>Errors: {currentErrors}</div>
      </div>

      <div
        ref={textAreaRef}
        tabIndex={0}
        onKeyDown={counter > 0 ? undefined : handleKeyDown  }
        className={`text-area p-4 bg-gray-900 rounded-lg font-mono text-lg leading-relaxed whitespace-pre-wrap focus:outline-none focus:ring-2 min-h-[200px] cursor-text`}
      >
        {renderText()}
        <span className="animate-pulse">|</span>
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