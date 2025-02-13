import React, { useState, useEffect } from 'react';
import { Users, Trophy, Star, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Contest = Database['public']['Tables']['contests']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type WSLRoster = Database['public']['Tables']['world_surf_league_rosters']['Row'];
type FSRoster = Database['public']['Tables']['fantasy_surfer_rosters']['Row'];
type Surfer = Database['public']['Tables']['surfers']['Row'];
type SurferPoints = Database['public']['Tables']['surfer_points']['Row'];

const TeamCompare: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [rosters, setRosters] = useState<{
    [userId: string]: {
      wsl: WSLRoster | null;
      fs: FSRoster | null;
      surfers: Record<string, Surfer>;
      wslPoints: Record<string, SurferPoints>;
      fsPoints: Record<string, SurferPoints>;
      wslTotal: number;
      fsTotal: number;
    };
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Fetch contests
        const { data: contestsData, error: contestsError } = await supabase
          .from('contests')
          .select('*')
          .order('start_date', { ascending: false });

        if (contestsError) throw contestsError;
        setContests(contestsData || []);

        // Set first contest as selected by default
        if (contestsData?.length) {
          setSelectedContest(contestsData[0]);
        }

        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('first_name');

        if (usersError) throw usersError;
        setUsers(usersData || []);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load initial data');
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchRosters() {
      if (!selectedContest || !selectedUsers.length) return;

      setLoading(true);
      setError(null);

      try {
        const newRosters: typeof rosters = {};

        for (const userId of selectedUsers) {
          // Fetch WSL roster
          const { data: wslData, error: wslError } = await supabase
            .from('world_surf_league_rosters')
            .select('*')
            .eq('user_id', userId)
            .eq('contest_id', selectedContest.id)
            .single();

          if (wslError && wslError.code !== 'PGRST116') throw wslError;

          // Fetch Fantasy Surfer roster
          const { data: fsData, error: fsError } = await supabase
            .from('fantasy_surfer_rosters')
            .select('*')
            .eq('user_id', userId)
            .eq('contest_id', selectedContest.id)
            .single();

          if (fsError && fsError.code !== 'PGRST116') throw fsError;

          // Get all unique surfer IDs
          const surferIds = new Set<string>();
          
          if (wslData) {
            [
              wslData.surfer_a1_id, wslData.surfer_a2_id,
              wslData.surfer_b1_id, wslData.surfer_b2_id,
              wslData.surfer_b3_id, wslData.surfer_b4_id,
              wslData.surfer_c1_id, wslData.surfer_c2_id
            ].forEach(id => surferIds.add(id));
          }

          if (fsData) {
            [
              fsData.surfer_1_id, fsData.surfer_2_id,
              fsData.surfer_3_id, fsData.surfer_4_id,
              fsData.surfer_5_id, fsData.surfer_6_id,
              fsData.surfer_7_id, fsData.surfer_8_id
            ].forEach(id => {
              if (id) surferIds.add(id);
            });
          }

          if (surferIds.size > 0) {
            // Fetch surfers
            const { data: surfersData, error: surfersError } = await supabase
              .from('surfers')
              .select('*')
              .in('id', Array.from(surferIds));

            if (surfersError) throw surfersError;

            // Fetch WSL points
            const { data: wslPointsData, error: wslPointsError } = await supabase
              .from('surfer_points')
              .select('*')
              .in('surfer_id', Array.from(surferIds))
              .eq('contest_id', selectedContest.id)
              .eq('league_type', 'wsl');

            if (wslPointsError) throw wslPointsError;

            // Fetch Fantasy Surfer points
            const { data: fsPointsData, error: fsPointsError } = await supabase
              .from('surfer_points')
              .select('*')
              .in('surfer_id', Array.from(surferIds))
              .eq('contest_id', selectedContest.id)
              .eq('league_type', 'fantasy_surfer');

            if (fsPointsError) throw fsPointsError;

            // Create maps for easy lookup
            const surfers = surfersData?.reduce((acc, surfer) => {
              acc[surfer.id] = surfer;
              return acc;
            }, {} as Record<string, Surfer>) || {};

            const wslPoints = wslPointsData?.reduce((acc, points) => {
              acc[points.surfer_id] = points;
              return acc;
            }, {} as Record<string, SurferPoints>) || {};

            const fsPoints = fsPointsData?.reduce((acc, points) => {
              acc[points.surfer_id] = points;
              return acc;
            }, {} as Record<string, SurferPoints>) || {};

            // Calculate totals
            let wslTotal = 0;
            let fsTotal = 0;

            if (wslData) {
              [
                wslData.surfer_a1_id, wslData.surfer_a2_id,
                wslData.surfer_b1_id, wslData.surfer_b2_id,
                wslData.surfer_b3_id, wslData.surfer_b4_id,
                wslData.surfer_c1_id, wslData.surfer_c2_id
              ].forEach(id => {
                const points = wslPoints[id]?.points || 0;
                wslTotal += id === wslData.power_surfer_id ? points * 2 : points;
              });
            }

            if (fsData) {
              [
                fsData.surfer_1_id, fsData.surfer_2_id,
                fsData.surfer_3_id, fsData.surfer_4_id,
                fsData.surfer_5_id, fsData.surfer_6_id,
                fsData.surfer_7_id, fsData.surfer_8_id
              ].forEach(id => {
                if (id) {
                  fsTotal += fsPoints[id]?.points || 0;
                }
              });
            }

            newRosters[userId] = {
              wsl: wslData || null,
              fs: fsData || null,
              surfers,
              wslPoints,
              fsPoints,
              wslTotal,
              fsTotal
            };
          }
        }

        setRosters(newRosters);
      } catch (err) {
        console.error('Error fetching rosters:', err);
        setError(err instanceof Error ? err.message : 'Failed to load rosters');
      } finally {
        setLoading(false);
      }
    }

    fetchRosters();
  }, [selectedContest, selectedUsers]);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading && !Object.keys(rosters).length) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">Loading...</div>
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
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative">
          <select
            value={selectedContest?.id || ''}
            onChange={(e) => {
              const contest = contests.find(c => c.id === e.target.value);
              setSelectedContest(contest || null);
            }}
            className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {contests.map((contest) => (
              <option key={contest.id} value={contest.id}>
                {contest.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="flex flex-wrap gap-2">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserToggle(user.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedUsers.includes(user.id)
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {user.first_name} {user.last_name}
            </button>
          ))}
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="grid grid-cols-1 gap-8">
          {selectedUsers.map((userId) => {
            const user = users.find(u => u.id === userId);
            const roster = rosters[userId];
            
            if (!user || !roster) return null;

            return (
              <div key={userId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.first_name} {user.last_name}
                  </h3>
                  <div className="mt-1 flex gap-4 text-sm text-gray-500">
                    <span>WSL Points: {roster.wslTotal.toLocaleString()}</span>
                    <span>FS Points: {roster.fsTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-6 grid gap-6">
                  {/* WSL Roster */}
                  {roster.wsl && (
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-4">WSL Fantasy Team</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { id: roster.wsl.surfer_a1_id, tier: 'A' },
                          { id: roster.wsl.surfer_a2_id, tier: 'A' },
                          { id: roster.wsl.surfer_b1_id, tier: 'B' },
                          { id: roster.wsl.surfer_b2_id, tier: 'B' },
                          { id: roster.wsl.surfer_b3_id, tier: 'B' },
                          { id: roster.wsl.surfer_b4_id, tier: 'B' },
                          { id: roster.wsl.surfer_c1_id, tier: 'C' },
                          { id: roster.wsl.surfer_c2_id, tier: 'C' }
                        ].map(({ id, tier }) => {
                          const surfer = roster.surfers[id];
                          const points = roster.wslPoints[id]?.points || 0;
                          if (!surfer) return null;

                          return (
                            <div
                              key={surfer.id}
                              className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900">
                                    {surfer.first_name} {surfer.last_name}
                                  </p>
                                  <span className="text-xs font-medium text-gray-500">
                                    Tier {tier}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                  <p className="text-sm text-gray-500">{surfer.country}</p>
                                  <p className="text-sm text-gray-500">
                                    Points: {(roster.wsl.power_surfer_id === surfer.id ? points * 2 : points).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              {roster.wsl.power_surfer_id === surfer.id && (
                                <Trophy className="w-5 h-5 text-yellow-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fantasy Surfer Roster */}
                  {roster.fs && (
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-4">Fantasy Surfer Team</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { id: roster.fs.surfer_1_id, price: roster.fs.surfer_1_price },
                          { id: roster.fs.surfer_2_id, price: roster.fs.surfer_2_price },
                          { id: roster.fs.surfer_3_id, price: roster.fs.surfer_3_price },
                          { id: roster.fs.surfer_4_id, price: roster.fs.surfer_4_price },
                          { id: roster.fs.surfer_5_id, price: roster.fs.surfer_5_price },
                          { id: roster.fs.surfer_6_id, price: roster.fs.surfer_6_price },
                          { id: roster.fs.surfer_7_id, price: roster.fs.surfer_7_price },
                          { id: roster.fs.surfer_8_id, price: roster.fs.surfer_8_price }
                        ].map(({ id, price }) => {
                          if (!id) return null;
                          const surfer = roster.surfers[id];
                          const points = roster.fsPoints[id]?.points || 0;
                          if (!surfer) return null;

                          return (
                            <div
                              key={surfer.id}
                              className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {surfer.first_name} {surfer.last_name}
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                  <p className="text-sm text-gray-500">{surfer.country}</p>
                                  <p className="text-sm text-gray-500">Points: {points.toLocaleString()}</p>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                ${price?.toLocaleString()}M
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamCompare;