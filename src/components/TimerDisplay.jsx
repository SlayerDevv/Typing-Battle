import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const TrafficLightTimer = ({ counter, status }) => {
  if (status === 'waiting' || counter === 0) {
    return null;
  }

  // Determine which light should be active based on counter
  const getColors = () => {
    if (counter > 5) {
      return ['bg-red-500', 'bg-gray-700', 'bg-gray-700']; // Red
    } else if (counter > 1) {
      return ['bg-gray-700', 'bg-yellow-400', 'bg-gray-700']; // Yellow
    } else if (counter === 1) {
      return ['bg-gray-700', 'bg-gray-700', 'bg-green-500 animate-pulse']; // Green when counter is 0
    }
  };

  const colors = getColors();

  return (
    <div className='absolute w-full h-screen bg-black bg-opacity-55 z-50 right-0 top-0'>

    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Card className="bg-gray-900 p-6 rounded-xl">
        <CardContent className="flex flex-col items-center gap-4 p-4">
         
          <div className="bg-gray-800 p-4 rounded-xl shadow-inner">
            
            {colors.map((color, index) => (
              <div key={index} className="relative mb-4 last:mb-0">
                <div className={`w-12 h-12 rounded-full ${color} `}>
                  {/* Light reflection effect */}
                  <div className="absolute top-1 left-2 w-2 h-2 bg-white opacity-30 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
          
         
          <div className="mt-2 bg-gray-800 px-3 py-1 rounded-lg">
            <span className="text-3xl  font-bold text-white">
              {counter}s
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default TrafficLightTimer;