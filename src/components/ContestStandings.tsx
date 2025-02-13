import React, { useState, useEffect } from 'react';
import { Trophy, Medal, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import MemberRoster from './MemberRoster';

type Contest = Database['public']['Tables']['contests']['Row'];
type Standing = Database['public']['Tables']['contest_standings']['Row'] & {
  user: Database['public']['Tables']['users']['Row'];
};

interface ContestStandingsProps {
  contest: Contest;
}

interface CombinedStanding {
  id: string;
  user: Database['public']['Tables']['users']['Row'];
  wslRank: number;
  fsRank: number;
  combinedScore: number;
}

const ContestStandings: React.FC<ContestStandingsProps> = ({ contest }) => {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [combinedStandings, setCombinedStandings] = useState<CombinedStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<'total' | 'wsl' | 'fantasy_surfer'>('total');
  const [selectedUser, setSelectedUser] = useState<Database['public']['Tables']['users']['Row'] | null>(null);

  useEffect(() => {
    async function fetchStandings() {
      try {
        setLoading(true);
        
        if (selectedLeague === 'total') {
          // Fetch both WSL and Fantasy Surfer standings
          const [wslResponse, fsResponse] = await Promise.all([
            supabase
              .from('contest_standings')
              .select('*, user:users(*)')
              .eq('contest_id', contest.id)
              .eq('league_type', 'wsl')
              .order('points', { ascending: false }),
            supabase
              .from('contest_standings')
              .select('*, user:users(*)')
              .eq('contest_id', contest.id)
              .eq('league_type', 'fantasy_surfer')
              .order('points', { ascending: false })
          ]);

          if (wslResponse.error) throw wslResponse.error;
          if (fsResponse.error) throw fsResponse.error;

          const wslStandings = wslResponse.data as Standing[];
          const fsStandings = fsResponse.data as Standing[];

          // Create a map of user IDs to their ranks in each league
          const userRanks = new Map<string, { wslRank: number; fsRank: number; user: any }>();

          // Process WSL rankings
          wslStandings.forEach((standing, index) => {
            userRanks.set(standing.user_id, {
              wslRank: index + 1,
              fsRank: 999, // Default high rank for users not in FS
              user: standing.user
            });
          });

          // Process FS rankings
          fsStandings.forEach((standing, index) => {
            const userData = userRanks.get(standing.user_id);
            if (userData) {
              userData.fsRank = index + 1;
            } else {
              userRanks.set(standing.user_id, {
                wslRank: 999, // Default high rank for users not in WSL
                fsRank: index + 1,
                user: standing.user
              });
            }
          });

          // Convert to combined standings and sort by combined rank
          const combined = Array.from(userRanks.entries()).map(([userId, data]) => ({
            id: userId,
            user: data.user,
            wslRank: data.wslRank,
            fsRank: data.fsRank,
            combinedScore: data.wslRank + data.fsRank
          }));

          combined.sort((a, b) => a.combinedScore - b.combinedScore);
          setCombinedStandings(combined);
          setStandings([]);
        } else {
          // Fetch regular standings for WSL or Fantasy Surfer
          const { data, error } = await supabase
            .from('contest_standings')
            .select('*, user:users(*)')
            .eq('contest_id', contest.id)
            .eq('league_type', selectedLeague)
            .order('points', { ascending: false });

          if (error) throw error;
          setStandings(data as Standing[]);
          setCombinedStandings([]);
        }
      } catch (err) {
        console.error('Error fetching standings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load standings');
      } finally {
        setLoading(false);
      }
    }

    fetchStandings();
  }, [contest.id, selectedLeague]);

  const startDate = new Date(contest.start_date);
  const endDate = new Date(contest.end_date);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{contest.name}</h2>
          <p className="text-gray-500 mt-1">
            {startDate.toLocaleDateString('en-US', { 
              month: 'long',
              day: 'numeric'
            })} - {endDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedLeague('total')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedLeague === 'total'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Combined
          </button>
          <button
            onClick={() => setSelectedLeague('wsl')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedLeague === 'wsl'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            WSL
          </button>
          <button
            onClick={() => setSelectedLeague('fantasy_surfer')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedLeague === 'fantasy_surfer'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Fantasy Surfer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-gray-500">Loading standings...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      ) : (
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
                  {selectedLeague === 'total' ? (
                    <>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        WSL Rank
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        FS Rank
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Combined
                      </th>
                    </>
                  ) : (
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedLeague === 'total' ? (
                  combinedStandings.map((standing, index) => (
                    <tr key={standing.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(standing.user)}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <span className="font-medium text-gray-900">
                          #{standing.wslRank}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <span className="font-medium text-gray-900">
                          #{standing.fsRank}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <span className="font-medium text-gray-900">
                          {standing.combinedScore}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  standings.map((standing, index) => (
                    <tr key={standing.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(standing.user)}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <span className="font-medium text-gray-900">
                          {standing.points.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUser && (
        <MemberRoster
          contest={contest}
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default ContestStandings;