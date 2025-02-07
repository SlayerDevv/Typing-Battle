interface OpponentStatsProps {
  playerName: string;
  wpm: number;
  accuracy: number;
  errors: number;
}

const OpponentStats: React.FC<OpponentStatsProps> = ({ playerName, wpm, accuracy, errors }) => {
  return (
    <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-75 p-4 rounded-lg text-white">
      <h3 className="font-bold mb-2">{playerName}&apos;s Progress</h3>
      <div className="space-y-1 text-sm">
        <div>WPM: {wpm}</div>
        <div>Accuracy: {accuracy}%</div>
        <div>Errors: {errors}</div>
      </div>
    </div>
  );
};

export default OpponentStats; 