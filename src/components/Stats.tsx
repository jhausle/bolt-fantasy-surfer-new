import React from 'react';
import { TrendingUp, Award, Users } from 'lucide-react';

const Stats: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Performance Stats</h2>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Season Rank</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">#4</p>
            </div>
            <Award className="w-12 h-12 text-yellow-500" />
          </div>
          <p className="mt-4 text-sm text-green-600">↑ Up 2 positions this month</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Points</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">2,550</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
          <p className="mt-4 text-sm text-gray-600">Last event: +850 points</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">League Position</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">Top 5%</p>
            </div>
            <Users className="w-12 h-12 text-green-500" />
          </div>
          <p className="mt-4 text-sm text-gray-600">Out of 12,453 players</p>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Season Performance</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Performance chart will be implemented here</p>
        </div>
      </div>
    </div>
  );
};

export default Stats;