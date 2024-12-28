import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const TimerDisplay = ({ counter , status}) => {
  if (counter === 0 || status ==='waiting') {
    return null;
  }

  return (
    <div className=" absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Card className="bg-purple-500 bg-opacity-20">
        <CardContent className="p-6">
          <span className="text-4xl font-bold text-white">
            Time elapsed: {counter}s
          </span>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimerDisplay;