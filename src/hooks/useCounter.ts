import { useState, useEffect } from "react";

export const useCounter = (initialTime = 0) => {
  const [Counter, setCounter] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let CounterInterval: NodeJS.Timeout | undefined;

    if (isRunning) {
      CounterInterval = setInterval(() => {
        setCounter((prev) => {
          if (prev <= 1) {
            clearInterval(CounterInterval);  // Clear the interval when counter reaches 0
            setIsRunning(false);
            return 0;  // Set counter to 0 when it finishes
          }
          return prev - 1;  // Decrement the counter by 1 every second
        });
      }, 1000);
    }

    // Cleanup interval on component unmount or when isRunning changes
    return () => {
      if (CounterInterval) {
        clearInterval(CounterInterval);
      }
    };
  }, [isRunning]);  // This effect runs when isRunning state changes

  const toggleStart = () => setIsRunning(true);
  const toggleStop = () => setIsRunning(false);
  const toggleReset = () => {
    setIsRunning(false);
    setCounter(initialTime);  // Reset to initial time
    
  };

  return { toggleStart, toggleStop, toggleReset, Counter, setCounter, isRunning, setIsRunning };
};
