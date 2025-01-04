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
  socket: any;
  roomId: string;
  playerId: string;
  counter: number;
  sampleText: string;
}

const TypingCmp: React.FC<TypingCmpProps> = ({ socket, roomId, playerId, counter,sampleText}) => {
  
  const [userInput, setUserInput] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [currentErrors, setCurrentErrors] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
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

  const textAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);

  // Add useEffect to check completion
  useEffect(() => {
    if (userInput.length === sampleText.length && userInput === sampleText) {
      setIsCompleted(true);
      
      socket.on("playerStats", ({ playerId: statsPlayerId, playerName: statsPlayerName, stats }: { playerId: string, playerName: string, stats: TypingStats }) => {
        if (statsPlayerId !== playerId) {
          setOpponentStats({
            playerName: statsPlayerName,
            ...stats,
          });
        }
      });
      socket.emit('raceCompleted', {
        roomId,
        playerId,
        stats
      });
    }
  }, [userInput, sampleText, stats, roomId, playerId, socket,stats]);

  const calculateStats = () => {
    if (!startTime) {
      setStartTime(Date.now());
      return;
    }

    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const wordsTyped = Math.round(currentPosition / 5);
    const wpm = Math.round(wordsTyped / timeElapsed) || 0;

    const currentErrorCount = Array.from(userInput).reduce((count, char, index) => {
      return count + (char !== sampleText[index] ? 1 : 0);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
    }

    if (e.key === 'Backspace') {
      if (userInput.length > 0) {
        setUserInput(prev => prev.slice(0, -1));
        setCurrentPosition(prev => prev - 1);
        calculateStats();
      }
    } else if (e.key.length === 1 && userInput.length < sampleText.length) {
      const newInput = userInput + e.key;
      setUserInput(newInput);
      setCurrentPosition(newInput.length);
      calculateStats();
    }
  };

  const renderText = () => {
    return (
      <>
        {Array.from(sampleText).map((char, index) => {
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
        onKeyDown={counter === 0 ? handleKeyDown : undefined}
        className={`text-area p-4 bg-gray-900 rounded-lg font-mono text-lg leading-relaxed whitespace-pre-wrap focus:outline-none focus:ring-2 min-h-[200px] cursor-text`}
      >
        {renderText()}
        <span className="animate-pulse">|</span>
      </div>
      <AlertDialog open={isCompleted}>
        <AlertDialogContent className="bg-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-center mb-4">
              Race Completed! 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-lg text-center">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="font-semibold text-white">WPM</div>
                  <div className="text-2xl text-green-400">{stats.wpm}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="font-semibold text-white">Accuracy</div>
                  <div className="text-2xl text-blue-400">
                    {stats.accuracy}%
                  </div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="font-semibold text-white">Errors</div>
                  <div className="text-2xl text-red-400">{stats.errors}</div>
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
                      <div className="text-2xl text-green-400">
                        {opponentStats.wpm}
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="font-semibold text-white">Accuracy</div>
                      <div className="text-2xl text-blue-400">
                        {opponentStats.accuracy}%
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="font-semibold text-white">Errors</div>
                      <div className="text-2xl text-red-400">
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
              className="bg-green-500 hover:bg-green-600"
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TypingCmp;