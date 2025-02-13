import React, { useState, useEffect } from 'react';
import { Trophy, Medal, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Contest = Database['public']['Tables']['contests']['Row'];

interface LeagueStanding {
  user: User;
  totalScore: number;
  contestResults: {
    [contestId: string]: {
      wslRank: number;
      fsRank: number;
      combinedScore: number;
    };
  };
}

const LeagueStandings: React.FC = () => {
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStandings() {
      try {
        setLoading(true);

        // First, fetch all contests
        const { data: contestsData, error: contestsError } = await supabase
          .from('contests')
          .select('*')
          .order('start_date', { ascending: true });

        if (contestsError) throw contestsError;
        setContests(contestsData);

        // Fetch all users
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*');

        if (usersError) throw usersError;

        // For each contest, get standings for both leagues
        const standingsMap = new Map<string, LeagueStanding>();

        for (const contest of contestsData) {
          const [wslResponse, fsResponse] = await Promise.all([
            supabase
              .from('contest_standings')
              .select('*')
              .eq('contest_id', contest.id)
              .eq('league_type', 'wsl')
              .order('points', { ascending: false }),
            supabase
              .from('contest_standings')
              .select('*')
              .eq('contest_id', contest.id)
              .eq('league_type', 'fantasy_surfer')
              .order('points', { ascending: false })
          ]);

          if (wslResponse.error) throw wslResponse.error;
          if (fsResponse.error) throw fsResponse.error;

          const wslStandings = wslResponse.data;
          const fsStandings = fsResponse.data;

          // Process rankings for this contest
          wslStandings.forEach((standing, index) => {
            const userStanding = standingsMap.get(standing.user_id) || {
              user: users.find(u => u.id === standing.user_id)!,
              totalScore: 0,
              contestResults: {}
            };

            userStanding.contestResults[contest.id] = {
              wslRank: index + 1,
              fsRank: 999, // Default high rank
              combinedScore: 999 // Will be updated when we find FS rank
            };

            standingsMap.set(standing.user_id, userStanding);
          });

          fsStandings.forEach((standing, index) => {
            const userStanding = standingsMap.get(standing.user_id) || {
              user: users.find(u => u.id === standing.user_id)!,
              totalScore: 0,
              contestResults: {}
            };

            if (userStanding.contestResults[contest.id]) {
              userStanding.contestResults[contest.id].fsRank = index + 1;
              userStanding.contestResults[contest.id].combinedScore = 
                userStanding.contestResults[contest.id].wslRank + (index + 1);
            } else {
              userStanding.contestResults[contest.id] = {
                wslRank: 999, // Default high rank
                fsRank: index + 1,
                combinedScore: 999 + (index + 1)
              };
            }

            standingsMap.set(standing.user_id, userStanding);
          });
        }

        // Calculate total scores and sort standings
        const finalStandings = Array.from(standingsMap.values()).map(standing => {
          standing.totalScore = Object.values(standing.contestResults)
            .reduce((sum, result) => sum + result.combinedScore, 0);
          return standing;
        });

        finalStandings.sort((a, b) => a.totalScore - b.totalScore);
        setStandings(finalStandings);
      } catch (err) {
        console.error('Error fetching standings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load standings');
      } finally {
        setLoading(false);
      }
    }

    fetchStandings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">Loading standings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">League Standings</h2>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                {contests.map(contest => (
                  <th key={contest.id} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {new Date(contest.start_date).toLocaleDateString('en-US', { month: 'short' })}
                  </th>
                ))}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.map((standing, index) => (
                <tr key={standing.user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 ? (
                        <Medal className={`w-5 h-5 mr-2 ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-400' :
                          'text-amber-600'
                        }`} />
                      ) : (
                        <span className="w-5 h-5 mr-2" />
                      )}
                      <span className="text-sm text-gray-900">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {standing.user.first_name} {standing.user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {standing.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  {contests.map(contest => {
                    const result = standing.contestResults[contest.id];
                    return (
                      <td key={contest.id} className="px-6 py-4 whitespace-nowrap text-center">
                        {result ? (
                          <span className="text-sm font-medium text-gray-900">
                            {result.combinedScore}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {standing.totalScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeagueStandings;