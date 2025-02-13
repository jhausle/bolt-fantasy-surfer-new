import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { updateAllRosters } from '../lib/wslService';
import type { Database } from '../lib/database.types';

const RosterUpdater: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Get active contest
      const { data: contest, error: contestError } = await supabase
        .from('contests')
        .select('*')
        .eq('is_active', true)
        .single();

      if (contestError) {
        console.error('Contest fetch error:', contestError);
        throw new Error(`Failed to fetch active contest: ${contestError.message}`);
      }

      if (!contest) {
        throw new Error('No active contest found. Please ensure a contest is marked as active.');
      }

      console.log('Updating rosters for contest:', {
        id: contest.id,
        name: contest.name,
        startDate: contest.start_date,
        endDate: contest.end_date
      });

      // Update WSL rosters using Edge Function
      const result = await updateAllRosters(contest.id);
      console.log('Update result:', result);
      
      setMessage(`${result.message}`);
      
      if (result.details) {
        const successful = result.details.filter(d => d.success).length;
        const failed = result.details.filter(d => !d.success).length;
        
        if (failed > 0) {
          const failedDetails = result.details
            .filter(d => !d.success)
            .map(d => `${d.user}: ${d.error || 'Unknown error'}`)
            .join('\n');
            
          console.error('Failed updates:', failedDetails);
          setError(`Warning: ${failed} roster(s) failed to update. Check console for details.`);
        }
      }
    } catch (err) {
      console.error('Error updating rosters:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(err instanceof Error ? err.message : 'Failed to update rosters');
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
            Update all WSL rosters for the active contest
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