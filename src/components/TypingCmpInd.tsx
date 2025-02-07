"use client"
import React, { useState, useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from './ui/button';
interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  totalTyped: number;
}

interface TypingCmpProps {
  playerId: string;
  counter: number;
  sampleText: string;
}

const TypingCmpInd: React.FC<TypingCmpProps> = ({ playerId, counter, sampleText }) => {
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

  const textAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (userInput.length === sampleText.length) {
      setIsCompleted(true);
      saveStats()
    }
  }, [userInput, sampleText]);

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

  // Audio refs
  const correctKeySound = useRef<HTMLAudioElement | null>(null);
  const errorKeySound = useRef<HTMLAudioElement | null>(null);
  const spaceKeySound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctKeySound.current = new Audio('/sounds/key-press.mp3');
    errorKeySound.current = new Audio('/sounds/key-error.mp3');
    spaceKeySound.current = new Audio('/sounds/key-space.mp3');

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
      sound.currentTime = 0;
      sound.play().catch(e => console.error('Error playing sound:', e));
    }
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
        playSound('correct');
      }
    } else if (e.key.length === 1 && userInput.length < sampleText.length) {
      const newInput = userInput + e.key;
      setUserInput(newInput);
      setCurrentPosition(newInput.length);
      calculateStats();

      if (e.key === ' ') {
        playSound('space');
      } else if (e.key === sampleText[userInput.length]) {
        playSound('correct');
      } else {
        playSound('error');
      }
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

  const reset= () => {
    setUserInput("");
    setCurrentPosition(0);
    setCurrentErrors(0);
    setStartTime(null);
    setStats({
      wpm: 0,
      accuracy: 100,
      errors: 0,
      totalTyped: 0,
    });
  }
  const saveStats = async () => {
    try {
      const response = await fetch('/api/typing-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          stats: {
            wpm: stats.wpm,
            errors: stats.errors,
            accuracy: stats.accuracy
          }
        })
      })
  
      if (!response.ok) {
        throw new Error('Failed to save stats')
      }
    } catch (error) {
      console.error('Error saving stats:', error)
    }
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
        onKeyDown={counter > 0 ? undefined : handleKeyDown}
        className="text-area p-4 bg-gray-900 rounded-lg font-mono text-lg leading-relaxed whitespace-pre-wrap focus:outline-none focus:ring-2 min-h-[200px] cursor-text"
      >
        {renderText()}
        <span className="animate-pulse">|</span>
      </div>
      <div className='flex justify-center'>
        <Button onClick={reset} className="bg-red-500 hover:bg-red-600 text-lg font-bold p-4 rounded-lg border"> 
          Replay
        </Button>
      </div>
      
      <AlertDialog open={isCompleted}>
        <AlertDialogContent className="bg-gray-800 text-white border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-center mb-4">
              Text Completed! {playerId}🎉
            </AlertDialogTitle>
            <div className='text-center space-y-4 text-lg'>   
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
              </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {setIsCompleted(false);reset()}}
              className="bg-green-500 hover:bg-green-600 w-full text-lg font-bold p-4 rounded-lg border"
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TypingCmpInd;