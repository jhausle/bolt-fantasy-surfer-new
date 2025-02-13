import React, { useState, useEffect } from 'react';
import { Users, Trophy, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Contest = Database['public']['Tables']['contests']['Row'];
type Surfer = Database['public']['Tables']['surfers']['Row'];

interface SurferStat {
  surfer: Surfer;
  wslCount: number;
  fsCount: number;
  wslPowerCount: number;
  totalTeams: number;
  percentageOwned: number;
}

interface SurferStatsProps {
  contest: Contest;
  onClose: () => void;
}

const SurferStats: React.FC<SurferStatsProps> = ({ contest, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SurferStat[]>([]);
  const [totalTeams, setTotalTeams] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get all surfers first
        const { data: surfers, error: surfersError } = await supabase
          .from('surfers')
          .select('*')
          .order('last_name');

        if (surfersError) throw surfersError;

        // Get WSL rosters
        const { data: wslRosters, error: wslError } = await supabase
          .from('world_surf_league_rosters')
          .select('*')
          .eq('contest_id', contest.id);

        if (wslError) throw wslError;

        // Get Fantasy Surfer rosters
        const { data: fsRosters, error: fsError } = await supabase
          .from('fantasy_surfer_rosters')
          .select('*')
          .eq('contest_id', contest.id);

        if (fsError) throw fsError;

        // Calculate stats for each surfer
        const surferStats = surfers.map(surfer => {
          const wslCount = wslRosters.filter(roster => 
            [
              roster.surfer_a1_id,
              roster.surfer_a2_id,
              roster.surfer_b1_id,
              roster.surfer_b2_id,
              roster.surfer_b3_id,
              roster.surfer_b4_id,
              roster.surfer_c1_id,
              roster.surfer_c2_id
            ].includes(surfer.id)
          ).length;

          const wslPowerCount = wslRosters.filter(roster =>
            roster.power_surfer_id === surfer.id
          ).length;

          const fsCount = fsRosters.filter(roster =>
            [
              roster.surfer_1_id,
              roster.surfer_2_id,
              roster.surfer_3_id,
              roster.surfer_4_id,
              roster.surfer_5_id,
              roster.surfer_6_id,
              roster.surfer_7_id,
              roster.surfer_8_id
            ].includes(surfer.id)
          ).length;

          const totalTeams = Math.max(wslRosters.length, fsRosters.length);
          const percentageOwned = totalTeams > 0 
            ? ((wslCount + fsCount) / (totalTeams * 2)) * 100 
            : 0;

          return {
            surfer,
            wslCount,
            fsCount,
            wslPowerCount,
            totalTeams,
            percentageOwned
          };
        });

        // Sort by total selections (WSL + FS)
        surferStats.sort((a, b) => 
          (b.wslCount + b.fsCount) - (a.wslCount + a.fsCount)
        );

        setStats(surferStats);
        setTotalTeams(Math.max(wslRosters.length, fsRosters.length));
      } catch (err) {
        console.error('Error fetching surfer stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load surfer statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [contest.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">Loading surfer statistics...</div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Surfer Selection Statistics</h2>
              <p className="text-gray-500 mt-1">{contest.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surfer
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WSL Teams
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Power Surfer
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FS Teams
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Owned
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.map((stat) => (
                  <tr key={stat.surfer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {stat.surfer.first_name} {stat.surfer.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stat.surfer.country}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm text-gray-900">{stat.wslCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-900">{stat.wslPowerCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <Star className="w-4 h-4 text-purple-500 mr-1" />
                        <span className="text-sm text-gray-900">{stat.fsCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${stat.percentageOwned}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {stat.percentageOwned.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurferStats;