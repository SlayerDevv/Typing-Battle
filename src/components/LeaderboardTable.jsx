"use client"
import React, { useEffect, useState } from 'react';
import { Medal, Trophy, Crown, Award } from 'lucide-react';

const LeaderboardTable = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch('/api/typing-stats');
        if (!response.ok) throw new Error('Failed to fetch scores');
        const data = await response.json();
        // Sort by WPM in descending order
        const sortedScores = data.sort((a, b) => b.wpm - a.wpm);
        setScores(sortedScores);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-lg text-gray-300">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-lg text-red-500">Error loading leaderboard: {error}</div>
      </div>
    );
  }

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Typing Speed Leaderboard 🏆
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-300 border-b border-gray-700">
              <th className="p-4 text-center">Rank</th>
              <th className="p-4 text-left">Player</th>
              <th className="p-4 text-right">WPM</th>
              <th className="p-4 text-right">Accuracy</th>
              <th className="p-4 text-right">Errors</th>
              <th className ='p-4 text-right'>Time Updated</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => (
              <tr 
                key={score._id} 
                className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex justify-center items-center">
                    {getRankIcon(index)}
                  </div>
                </td>
                <td className="p-4 font-medium text-gray-200">
                  {score.playerId}
                </td>
                <td className="p-4 text-right text-green-400 font-bold">
                  {score.wpm}
                </td>
                <td className="p-4 text-right text-blue-400">
                  {score.accuracy}%
                </td>
                <td className="p-4 text-right text-red-400">
                  {score.errors}
                </td>
                <td className="p-4 text-right text-gray-400">
                  {new Date(score.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;