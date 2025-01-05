import React from "react";
import { Circle } from "lucide-react";

const SecondTimerDisplay = ({ counter, status }) => {
  // Calculate percentage for progress indication
  const maxTime = counter;
  const progress = (counter / maxTime) * 100;
  
  return (
    <div className="fixed top-4 left-4 p-4 backdrop-blur-sm bg-slate-900/80 rounded-lg shadow-xl border border-slate-700">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Circle
            className={`w-8 h-8 text-purple-500 animate-pulse ${
              counter <= 10 ? 'text-red-500' : ''
            }`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-sm font-mono">{counter}</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <p className="text-slate-300 text-sm font-semibold">
            Time Remaining
          </p>
          <div className="w-32 h-2 bg-slate-700 rounded-full mt-1 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                counter <= 10 
                  ? 'bg-red-500' 
                  : counter <= 30 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondTimerDisplay;