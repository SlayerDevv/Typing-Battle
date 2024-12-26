import React, { useState, useEffect, useRef } from 'react';

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
}

const TypingCmp: React.FC<TypingCmpProps> = ({ socket, roomId, playerId }) => {
  const sampleText = "The quick brown fox jumps over the lazy dog. Programming is the art of telling another human what one wants the computer to do.";
  
  const [userInput, setUserInput] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [currentErrors, setCurrentErrors] = useState<number>(0);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    errors: 0,
    totalTyped: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const calculateStats = () => {
    if (!startTime) {
      setStartTime(Date.now());
      return;
    }

    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    const wordsTyped = Math.round(currentPosition / 5); // Standard: 5 characters = 1 word
    const wpm = Math.round(wordsTyped / timeElapsed) || 0;

    // Count current errors (only uncorrected ones)
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
      errors: currentErrorCount, // Only showing current errors
      totalTyped: currentPosition,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Handle backspace
    if (input.length < userInput.length) {
      setUserInput(input);
      setCurrentPosition(input.length);
      calculateStats();
      return;
    }

    // Handle regular typing
    setUserInput(input);
    setCurrentPosition(input.length);
    calculateStats();
  };

  const renderText = () => {
    return (
      <div className="font-mono text-lg leading-relaxed whitespace-pre-wrap">
        {Array.from(sampleText).map((char, index) => {
          let charClass = "text-gray-400"; // Default untyped text
          
          if (index < userInput.length) {
            if (userInput[index] === char) {
              charClass = "text-white"; // Correctly typed character
            } else {
              charClass = "text-red-500"; // Incorrectly typed character
            }
          } else if (index === userInput.length) {
            charClass = "text-white bg-white/20"; // Current character indicator
          }

          // Add extra space after each word
          const isSpace = char === " ";
          const extraClass = isSpace ? "mr-1" : "";

          return (
            <span key={index} className={`${charClass} ${extraClass}`}>
              {char}
            </span>
          );
        })}
      </div>
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

      <div className="text-area p-4 bg-gray-900 rounded-lg">
        {renderText()}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleInputChange}
        className="opacity-0 absolute left-0 w-full"
        autoFocus
      />
    </div>
  );
};

export default TypingCmp;
