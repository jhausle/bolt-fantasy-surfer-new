import React from 'react';
import { Trophy, Star, Hash } from 'lucide-react';

interface SurferCardProps {
  name: string;
  imageUrl: string;
  stats: {
    events: number;
    avgScore: number;
    rank: number;
  };
}

const SurferCard: React.FC<SurferCardProps> = ({ name, imageUrl, stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <Trophy className="w-6 h-6 mx-auto text-yellow-500" />
            <p className="mt-1 text-sm text-gray-500">Events</p>
            <p className="font-semibold">{stats.events}</p>
          </div>
          <div className="text-center">
            <Star className="w-6 h-6 mx-auto text-blue-500" />
            <p className="mt-1 text-sm text-gray-500">Avg Score</p>
            <p className="font-semibold">{stats.avgScore}</p>
          </div>
          <div className="text-center">
            <Hash className="w-6 h-6 mx-auto text-green-500" />
            <p className="mt-1 text-sm text-gray-500">Rank</p>
            <p className="font-semibold">#{stats.rank}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurferCard;