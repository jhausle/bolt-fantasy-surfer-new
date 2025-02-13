import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Surfer {
  name: string;
  ownership: string;
  points: number;
  rank: string;
  cost: string;
}

interface ContestHistory {
  name: string;
  totalPoints: number;
  rank: string;
  totalSpent: string;
  surfers: Surfer[];
}

interface TeamRoster {
  userId: string;
  fantasyId: string;
  contests: ContestHistory[];
}

const TestScraper: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rosters, setRosters] = useState<TeamRoster[] | null>(null);
  const [responseInfo, setResponseInfo] = useState<{
    totalTeams?: number;
    successfulFetches?: number;
    failedFetches?: number;
  } | null>(null);

  const fetchRosters = async () => {
    setLoading(true);
    setError(null);
    setRosters(null);
    setResponseInfo(null);

    try {
      console.log('Invoking fetch-fantasy-surfer-roster function...');
      const { data, error } = await supabase.functions.invoke('fetch-fantasy-surfer-roster', {
        body: {
          contestId: '61475ece-c201-4f5d-9699-327241b544fe'
        }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Response from function:', data);
      
      if (!data?.rosters) {
        throw new Error('No roster data received');
      }

      setRosters(data.rosters);
      setResponseInfo({
        totalTeams: data.totalTeams,
        successfulFetches: data.successfulFetches,
        failedFetches: data.failedFetches
      });
    } catch (err) {
      console.error('Error fetching rosters:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rosters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Fantasy Surfer Roster Scraper</h2>
        <button
          onClick={fetchRosters}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Fetching...' : 'Fetch All Rosters'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {responseInfo && (
        <div className="bg-blue-50 text-blue-600 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Response Info</h3>
          <p>Total Teams: {responseInfo.totalTeams}</p>
          <p>Successful Fetches: {responseInfo.successfulFetches}</p>
          <p>Failed Fetches: {responseInfo.failedFetches}</p>
        </div>
      )}

      {rosters && (
        <div className="space-y-8">
          {rosters.map((teamRoster, teamIndex) => (
            <div key={teamIndex} className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Team ID: {teamRoster.fantasyId}
              </h3>
              {teamRoster.contests.map((contest, contestIndex) => (
                <div key={contestIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <h4 className="text-lg font-semibold text-gray-900">{contest.name}</h4>
                    <div className="mt-1 text-sm text-gray-500 flex gap-4">
                      <span>Total Points: {contest.totalPoints}</span>
                      <span>Rank: {contest.rank}</span>
                      <span>Total Spent: {contest.totalSpent}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Surfer
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ownership
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Points
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {contest.surfers.map((surfer, surferIndex) => (
                          <tr key={surferIndex} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {surfer.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              {surfer.ownership}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              {surfer.points}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              {surfer.rank}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              {surfer.cost}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TestScraper;