import React from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
  } from "@/components/ui/alert-dialog";

interface CompletionDialogProps {
  isCompleted: boolean;
  setIsCompleted: (value: boolean) => void;
  stats: { wpm: number; accuracy: number; errors: number };
  opponentStats?: { playerName: string; wpm: number; accuracy: number; errors: number };
  handleReset: () => void;
  handleChangeText: () => void;
}

const CompletionDialog = ({
  isCompleted,
  setIsCompleted,
  stats,
  opponentStats,
  handleReset,
  handleChangeText
}: CompletionDialogProps) => {
  return (
    <AlertDialog open={isCompleted}>
      <AlertDialogContent className="bg-gray-800 text-white border-none">
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
  );
};

export default CompletionDialog;