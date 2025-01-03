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
  counter: number;
}

const TypingCmp: React.FC<TypingCmpProps> = ({ socket, roomId, playerId, counter}) => {
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

  const textAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);

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
    // Prevent default behavior for Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
    }

    // Handle only printable characters and backspace
    if (e.key === 'Backspace') {
      if (userInput.length > 0) {
        setUserInput(prev => prev.slice(0, -1));
        setCurrentPosition(prev => prev - 1);
        calculateStats();
      }
    } else if (e.key.length === 1) { // Only handle printable characters
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
    </div>
  );
};

export default TypingCmp;