import React from 'react';
import { Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Contest = Database['public']['Tables']['contests']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type WSLRoster = Database['public']['Tables']['world_surf_league_rosters']['Row'];
type FSRoster = Database['public']['Tables']['fantasy_surfer_rosters']['Row'];
type Surfer = Database['public']['Tables']['surfers']['Row'];
type SurferPoints = Database['public']['Tables']['surfer_points']['Row'];

interface MemberRosterProps {
  contest: Contest;
  user: User;
  onClose: () => void;
}

const MemberRoster: React.FC<MemberRosterProps> = ({ contest, user, onClose }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [wslRoster, setWslRoster] = React.useState<WSLRoster | null>(null);
  const [fsRoster, setFsRoster] = React.useState<FSRoster | null>(null);
  const [surfers, setSurfers] = React.useState<Record<string, Surfer>>({});
  const [wslPoints, setWslPoints] = React.useState<Record<string, SurferPoints>>({});
  const [fsPoints, setFsPoints] = React.useState<Record<string, SurferPoints>>({});

  React.useEffect(() => {
    async function fetchRosters() {
      try {
        // Fetch WSL roster
        const { data: wslData, error: wslError } = await supabase
          .from('world_surf_league_rosters')
          .select('*')
          .eq('user_id', user.id)
          .eq('contest_id', contest.id)
          .limit(1);

        if (wslError) throw wslError;
        if (wslData && wslData.length > 0) {
          setWslRoster(wslData[0]);
        }

        // Fetch Fantasy Surfer roster
        const { data: fsData, error: fsError } = await supabase
          .from('fantasy_surfer_rosters')
          .select('*')
          .eq('user_id', user.id)
          .eq('contest_id', contest.id)
          .limit(1);

        if (fsError) throw fsError;
        if (fsData && fsData.length > 0) {
          setFsRoster(fsData[0]);
        }

        // Get all unique surfer IDs from both rosters
        const surferIds = new Set<string>();
        
        if (wslData?.[0]) {
          [
            wslData[0].surfer_a1_id, wslData[0].surfer_a2_id,
            wslData[0].surfer_b1_id, wslData[0].surfer_b2_id,
            wslData[0].surfer_b3_id, wslData[0].surfer_b4_id,
            wslData[0].surfer_c1_id, wslData[0].surfer_c2_id,
            wslData[0].power_surfer_id
          ].forEach(id => surferIds.add(id));
        }

        if (fsData?.[0]) {
          [
            fsData[0].surfer_1_id, fsData[0].surfer_2_id,
            fsData[0].surfer_3_id, fsData[0].surfer_4_id,
            fsData[0].surfer_5_id, fsData[0].surfer_6_id,
            fsData[0].surfer_7_id, fsData[0].surfer_8_id
          ].forEach(id => {
            if (id) surferIds.add(id);
          });
        }

        if (surferIds.size > 0) {
          // Fetch all surfers in one query
          const { data: surfersData, error: surfersError } = await supabase
            .from('surfers')
            .select('*')
            .in('id', Array.from(surferIds));

          if (surfersError) throw surfersError;

          // Create a map of surfer IDs to surfer data
          const surfersMap = surfersData?.reduce((acc, surfer) => {
            acc[surfer.id] = surfer;
            return acc;
          }, {} as Record<string, Surfer>);

          setSurfers(surfersMap || {});

          // Fetch WSL points
          const { data: wslPointsData, error: wslPointsError } = await supabase
            .from('surfer_points')
            .select('*')
            .in('surfer_id', Array.from(surferIds))
            .eq('contest_id', contest.id)
            .eq('league_type', 'wsl');

          if (wslPointsError) throw wslPointsError;

          // Create a map of surfer IDs to WSL points data
          const wslPointsMap = wslPointsData?.reduce((acc, points) => {
            acc[points.surfer_id] = points;
            return acc;
          }, {} as Record<string, SurferPoints>);

          setWslPoints(wslPointsMap || {});

          // Fetch Fantasy Surfer points
          const { data: fsPointsData, error: fsPointsError } = await supabase
            .from('surfer_points')
            .select('*')
            .in('surfer_id', Array.from(surferIds))
            .eq('contest_id', contest.id)
            .eq('league_type', 'fantasy_surfer');

          if (fsPointsError) throw fsPointsError;

          // Create a map of surfer IDs to Fantasy Surfer points data
          const fsPointsMap = fsPointsData?.reduce((acc, points) => {
            acc[points.surfer_id] = points;
            return acc;
          }, {} as Record<string, SurferPoints>);

          setFsPoints(fsPointsMap || {});
        }
      } catch (err) {
        console.error('Error fetching rosters:', err);
        setError(err instanceof Error ? err.message : 'Failed to load rosters');
      } finally {
        setLoading(false);
      }
    }

    fetchRosters();
  }, [contest.id, user.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">Loading rosters...</div>
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
              <h2 className="text-2xl font-bold text-gray-900">
                {user.first_name} {user.last_name}'s Rosters
              </h2>
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

          <div className="space-y-8">
            {/* WSL Roster */}
            {wslRoster && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">WSL Fantasy Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: wslRoster.surfer_a1_id, tier: 'A' },
                    { id: wslRoster.surfer_a2_id, tier: 'A' },
                    { id: wslRoster.surfer_b1_id, tier: 'B' },
                    { id: wslRoster.surfer_b2_id, tier: 'B' },
                    { id: wslRoster.surfer_b3_id, tier: 'B' },
                    { id: wslRoster.surfer_b4_id, tier: 'B' },
                    { id: wslRoster.surfer_c1_id, tier: 'C' },
                    { id: wslRoster.surfer_c2_id, tier: 'C' }
                  ].map(({ id, tier }) => {
                    const surfer = surfers[id];
                    const points = wslPoints[id]?.points || 0;
                    if (!surfer) return null;
                    
                    return (
                      <div
                        key={surfer.id}
                        className="bg-white border rounded-lg p-4 flex items-center justify-between"
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
                          </div>
                        </div>
                        {wslRoster.power_surfer_id === surfer.id ? (
                          <div className="flex flex-col items-center">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-900 mt-1">
                              {points.toLocaleString()} pts
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            {points.toLocaleString()} pts
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fantasy Surfer Roster */}
            {fsRoster && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fantasy Surfer Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: fsRoster.surfer_1_id, price: fsRoster.surfer_1_price },
                    { id: fsRoster.surfer_2_id, price: fsRoster.surfer_2_price },
                    { id: fsRoster.surfer_3_id, price: fsRoster.surfer_3_price },
                    { id: fsRoster.surfer_4_id, price: fsRoster.surfer_4_price },
                    { id: fsRoster.surfer_5_id, price: fsRoster.surfer_5_price },
                    { id: fsRoster.surfer_6_id, price: fsRoster.surfer_6_price },
                    { id: fsRoster.surfer_7_id, price: fsRoster.surfer_7_price },
                    { id: fsRoster.surfer_8_id, price: fsRoster.surfer_8_price }
                  ].map(({ id, price }) => {
                    if (!id) return null;
                    const surfer = surfers[id];
                    const points = fsPoints[id]?.points || 0;
                    if (!surfer) return null;

                    return (
                      <div
                        key={surfer.id}
                        className="bg-white border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {surfer.first_name} {surfer.last_name}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-500">{surfer.country}</p>
                            <p className="text-sm text-gray-500">${price?.toLocaleString()}M</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {points.toLocaleString()} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberRoster;