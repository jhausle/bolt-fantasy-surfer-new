import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { updateAllRosters } from '../lib/wslService';
import type { Database } from '../lib/database.types';

const RosterUpdater: React.FC<{ selectedContestId?: string }> = ({ selectedContestId }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      let contest;
      
      console.log('Selected contest ID:', selectedContestId);

      if (selectedContestId) {
        const { data, error: contestError } = await supabase
          .from('contests')
          .select('*')
          .eq('id', selectedContestId)
          .single();
          
        if (contestError) throw contestError;
        contest = data;
      } else {
        // Fallback to active contest
        const { data, error: contestError } = await supabase
          .from('contests')
          .select('*')
          .eq('is_active', true)
          .single();
          
        if (contestError) throw contestError;
        contest = data;
      }

      if (!contest) {
        throw new Error(selectedContestId 
          ? 'Selected contest not found.' 
          : 'No active contest found. Please ensure a contest is marked as active.');
      }

      console.log('Contest being used:', contest);

      // Use supabase client's invoke method
      const { data: rosterData, error: rosterError } = await supabase.functions.invoke(
        'fetch-wsl-roster',  // Make sure this matches your function name exactly
        {
          body: { contestId: contest.id }
        }
      );

      if (rosterError) {
        throw new Error(`Failed to update rosters: ${rosterError.message}`);
      }

      console.log('Roster update response:', rosterData);

      // Then update points
      const { data: pointsData, error: pointsError } = await supabase.functions.invoke(
        'fetch-wsl-points',
        {
          body: { 
            contestId: contest.id,
            stopNumber: contest.stop_number
          }
        }
      );

      if (pointsError) {
        throw new Error(`Failed to update points: ${pointsError.message}`);
      }

      setMessage('Successfully updated rosters and points!');
    } catch (err) {
      console.error('Error updating:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Update WSL Rosters</h3>
          <p className="text-sm text-gray-500 mt-1">
            {selectedContestId 
              ? "Update WSL rosters for the selected contest"
              : "Update all WSL rosters for the active contest"}
          </p>
        </div>
        <button
          onClick={handleUpdate}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Updating...' : 'Update Rosters'}
        </button>
      </div>

      {message && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default RosterUpdater;